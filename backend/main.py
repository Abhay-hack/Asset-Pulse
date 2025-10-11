from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import aiohttp
import asyncio
import logging
import yfinance as yf
from dotenv import load_dotenv
from functools import wraps
import time
from datetime import datetime
from contextlib import asynccontextmanager
import asyncpg  # New: Async PostgreSQL driver

load_dotenv()

app = FastAPI()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL")
ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY")
NEON_ENDPOINT_ID = os.getenv("NEON_ENDPOINT_ID")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in .env")

# Append Neon endpoint for SNI/SSL stability if provided
if 'neon.tech' in DATABASE_URL and NEON_ENDPOINT_ID:
    DATABASE_URL += f"?options=endpoint%3D{NEON_ENDPOINT_ID}&sslmode=require"

# Pydantic models (unchanged)
class Asset(BaseModel):
    id: int | None = None
    name: str
    symbol: str
    price: float
    is_favorite: bool | None = False
    created_at: str | None = None

class AssetCreate(BaseModel):
    name: str
    symbol: str
    price: float
    is_favorite: bool = False

# Global price cache: {symbol: (price, timestamp)}
price_cache = {}
CACHE_TTL = 300  # 5 minutes

# Daily call counter (reset at midnight UTC)
daily_calls = 0
last_reset = datetime.utcnow().date()
DAILY_LIMIT = 20  # Buffer under 25

def reset_daily_counter():
    global daily_calls, last_reset
    today = datetime.utcnow().date()
    if today > last_reset:
        daily_calls = 0
        last_reset = today

# Async DB Pool
db_pool = None

async def init_db_pool():
    global db_pool
    db_pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=1,
        max_size=5,
        command_timeout=60,
        server_settings={'application_name': 'asset-pulse'},
    )

@app.on_event("startup")
async def startup():
    await init_db_pool()
    reset_daily_counter()

async def get_connection():
    if not db_pool:
        await init_db_pool()
    return await db_pool.acquire()

def db_retry(max_retries=3):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except (asyncpg.exceptions.ConnectionDoesNotExistError, asyncpg.exceptions._base.InterfaceError) as e:
                    if "SSL connection has been closed" in str(e) and attempt < max_retries - 1:
                        logger.warning(f"DB SSL retry {attempt+1}/{max_retries}: {e}")
                        await asyncio.sleep(2 ** attempt)  # Backoff
                        continue
                    raise
            return None
        return wrapper
    return decorator

def should_fetch_price(symbol: str, refresh: bool = False) -> bool:
    if not refresh:
        # If no refresh, use cached or stored without API call
        return False
    reset_daily_counter()
    if daily_calls >= DAILY_LIMIT:
        logger.warning(f"Daily quota neared ({daily_calls}/{DAILY_LIMIT}); skipping {symbol}")
        return False
    now = time.time()
    cached = price_cache.get(symbol.upper())
    if cached and now - cached[1] < CACHE_TTL:
        logger.info(f"Using cached price for {symbol}")
        return False
    return True

# Async USD to INR converter (free, daily rate)
async def get_usd_to_inr_rate(session: aiohttp.ClientSession) -> float:
    try:
        async with session.get("https://api.exchangerate-api.com/v4/latest/USD", timeout=aiohttp.ClientTimeout(total=5)) as resp:
            if resp.status == 200:
                rates = await resp.json()
                return rates.get('rates', {}).get('INR', 83.5)
        return 83.5  # Fallback
    except Exception as e:
        logger.error(f"USD-INR fetch error: {e}")
        return 83.5

# Crypto ID map for CoinGecko
CRYPTO_MAP = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'BNB': 'bnb',
    'XRP': 'xrp',
    'SOL': 'solana',
    'USDC': 'usdc',
    'TRX': 'tron',
    'DOGE': 'dogecoin',
    'ADA': 'cardano',
}

# Common US stocks
US_STOCKS = {
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 
    'NFLX', 'BABA', 'AMD', 'GOOG', 'JPM', 'V', 'JNJ'
}

async def fetch_live_price(session: aiohttp.ClientSession, symbol: str, max_retries: int = 3, refresh: bool = False) -> float | None:
    """Fetch live price in INR using Alpha Vantage (primary) or yfinance (fallback) for US stocks or CoinGecko for crypto."""
    symbol_upper = symbol.upper()
    is_crypto = symbol_upper in CRYPTO_MAP

    if is_crypto:
        return await _fetch_crypto_price(session, symbol)

    # For US stocks only
    if symbol_upper not in US_STOCKS:
        logger.warning(f"Unsupported stock symbol (US only): {symbol}")
        return None

    # Try Alpha first
    alpha_price = await _fetch_alpha_price(session, symbol, max_retries)
    if alpha_price:
        return alpha_price

    # Fallback to yfinance (unlimited)
    logger.info(f"Alpha limited; falling back to yfinance for {symbol}")
    return await _fetch_yfinance_price(session, symbol)

async def _fetch_alpha_price(session: aiohttp.ClientSession, symbol: str, max_retries: int = 3) -> float | None:
    """Alpha Vantage fetch with retries."""
    if not ALPHA_VANTAGE_KEY:
        return None

    ticker_sym = symbol.upper()
    for attempt in range(max_retries):
        try:
            url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker_sym}&apikey={ALPHA_VANTAGE_KEY}"
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    quote = data.get('Global Quote', {})
                    raw_price_str = quote.get('05. price', '0')
                    raw_price = float(raw_price_str) if raw_price_str else 0
                    if raw_price > 0:
                        usd_to_inr = await get_usd_to_inr_rate(session)
                        price = raw_price * usd_to_inr
                        logger.info(f"Fetched US stock {symbol} via Alpha: ₹{price}")
                        return price

                # Rate limit check
                text = await resp.text()
                if 'Note' in text or 'limit' in text.lower() or 'Invalid API call' in text:
                    if attempt < max_retries - 1:
                        delay = 60 * (2 ** attempt)  # 1min backoff
                        logger.warning(f"Alpha Vantage limited for {symbol} (attempt {attempt+1}), waiting {delay}s")
                        await asyncio.sleep(delay)
                        continue

                return None
        except Exception as e:
            error_str = str(e).lower()
            if any(lim in error_str for lim in ['limit', '429', 'too many', 'invalid api']):
                if attempt < max_retries - 1:
                    delay = 60 * (2 ** attempt)
                    logger.warning(f"Rate limited for {symbol} (attempt {attempt+1}), waiting {delay}s")
                    await asyncio.sleep(delay)
                    continue
            logger.error(f"Failed Alpha fetch for {symbol}: {e}")
            return None

async def _fetch_yfinance_price(session: aiohttp.ClientSession, symbol: str) -> float | None:
    """Fallback yfinance fetch (sync, wrapped async)."""
    try:
        # Run sync yfinance in thread to avoid blocking
        loop = asyncio.get_event_loop()
        ticker = await loop.run_in_executor(None, lambda: yf.Ticker(symbol))
        # Use 'regularMarketPrice' for current price (more reliable than history)
        raw_price = ticker.info.get('regularMarketPrice') or ticker.info.get('currentPrice')
        if raw_price and raw_price > 0:
            usd_to_inr = await get_usd_to_inr_rate(session)
            price = raw_price * usd_to_inr
            logger.info(f"Fetched US stock {symbol} via yfinance: ₹{price}")
            return price
        return None
    except Exception as e:
        logger.error(f"yfinance fetch error for {symbol}: {e}")
        return None

async def _fetch_crypto_price(session: aiohttp.ClientSession, symbol: str) -> float | None:
    """Fallback CoinGecko for crypto (USD → INR)."""
    symbol_upper = symbol.upper()
    coin_id = CRYPTO_MAP.get(symbol_upper)
    if not coin_id:
        logger.warning(f"Unsupported crypto symbol: {symbol}")
        return None
    try:
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd"
        async with session.get(url) as resp:
            if resp.status == 200:
                data = await resp.json()
                usd_price = data.get(coin_id, {}).get('usd')
                if usd_price:
                    usd_to_inr = await get_usd_to_inr_rate(session)
                    price = usd_price * usd_to_inr
                    logger.info(f"Fetched/Converted crypto {symbol}: ₹{price}")
                    return float(price)
        return None
    except Exception as e:
        logger.error(f"Crypto fetch error for {symbol}: {e}")
        return None

# /assets endpoint (sequential with delays)
# /assets endpoint (sequential with delays)
@app.get("/assets", response_model=List[Asset])
@db_retry()
async def get_assets(refresh: bool = Query(default=False)):
    reset_daily_counter()
    assets = []
    async with aiohttp.ClientSession() as session:
        conn = None
        try:
            conn = await get_connection()
            rows = await conn.fetch(
                "SELECT id, name, symbol, price, is_favorite, created_at FROM assets ORDER BY id DESC"
            )

            for i, r in enumerate(rows):
                asset_id = int(r['id'])
                name = r['name']
                symbol = r['symbol']
                stored_price = float(r['price'])
                is_favorite = r['is_favorite']
                created_at = r['created_at']

                symbol_upper = symbol.upper()
                live_price = None
                if should_fetch_price(symbol, refresh):
                    live_price = await fetch_live_price(session, symbol, refresh=refresh)
                    if live_price and symbol_upper not in CRYPTO_MAP:  # Count Alpha calls only
                        global daily_calls
                        daily_calls += 1
                    if live_price:
                        price_cache[symbol_upper] = (live_price, time.time())
                        await conn.execute("UPDATE assets SET price = $1 WHERE id = $2", live_price, asset_id)
                        logger.info(f"Updated {symbol} to ₹{live_price}")

                # Use live or cached or stored
                cached_price, _ = price_cache.get(symbol_upper, (stored_price, 0))
                price = live_price or cached_price

                assets.append(
                    Asset(
                        id=asset_id,
                        name=name,
                        symbol=symbol,
                        price=price,
                        is_favorite=is_favorite,
                        created_at=str(created_at),
                    )
                )

                # Delay only if fetching Alpha
                if i < len(rows) - 1 and symbol_upper not in CRYPTO_MAP and should_fetch_price(symbol, refresh):
                    await asyncio.sleep(15)

            return assets
        except Exception as e:
            logger.error(f"Error in get_assets: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch assets")
        finally:
            if conn and db_pool:
                await db_pool.release(conn)

# /favorites (same as /assets but filtered)
# /favorites (same as /assets but filtered)
@app.get("/favorites", response_model=List[Asset])
@db_retry()
async def get_favorites(refresh: bool = Query(default=False)):
    reset_daily_counter()
    favorites = []
    async with aiohttp.ClientSession() as session:
        conn = None
        try:
            conn = await get_connection()
            rows = await conn.fetch(
                "SELECT id, name, symbol, price, is_favorite, created_at FROM assets WHERE is_favorite=true ORDER BY id DESC"
            )

            for i, r in enumerate(rows):
                asset_id = int(r['id'])
                name = r['name']
                symbol = r['symbol']
                stored_price = float(r['price'])
                is_favorite = r['is_favorite']
                created_at = r['created_at']

                symbol_upper = symbol.upper()
                live_price = None
                if should_fetch_price(symbol, refresh):
                    live_price = await fetch_live_price(session, symbol, refresh=refresh)
                    if live_price and symbol_upper not in CRYPTO_MAP:
                        global daily_calls
                        daily_calls += 1
                    if live_price:
                        price_cache[symbol_upper] = (live_price, time.time())
                        await conn.execute("UPDATE assets SET price = $1 WHERE id = $2", live_price, asset_id)
                        logger.info(f"Updated {symbol} to ₹{live_price}")

                cached_price, _ = price_cache.get(symbol_upper, (stored_price, 0))
                price = live_price or cached_price

                favorites.append(
                    Asset(
                        id=asset_id,
                        name=name,
                        symbol=symbol,
                        price=price,
                        is_favorite=is_favorite,
                        created_at=str(created_at),
                    )
                )

                if i < len(rows) - 1 and symbol_upper not in CRYPTO_MAP and should_fetch_price(symbol, refresh):
                    await asyncio.sleep(15)

            return favorites
        except Exception as e:
            logger.error(f"Error in get_favorites: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch favorites")
        finally:
            if conn and db_pool:
                await db_pool.release(conn)
                
# Other endpoints
@app.get("/")
async def root():
    return {"message": "Backend is running", "endpoints": ["/health", "/assets", "/favorites"]}

@app.get("/health")
@db_retry()
async def health():
    try:
        conn = await get_connection()
        await conn.fetchval("SELECT 1")
        await db_pool.release(conn)
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/assets", response_model=Asset)
@db_retry()
async def add_asset(asset: AssetCreate):
    if not asset.name.strip() or not asset.symbol.strip() or asset.price <= 0:
        raise HTTPException(status_code=400, detail="Invalid input: name/symbol required, price > 0")
    conn = None
    try:
        conn = await get_connection()
        async with conn.transaction():
            row = await conn.fetchrow(
                """
                INSERT INTO assets (name, symbol, price, is_favorite) 
                VALUES ($1, $2, $3, $4) 
                RETURNING id, name, symbol, price, is_favorite, created_at
                """,
                asset.name.strip(),
                asset.symbol.strip().upper(),
                asset.price,
                asset.is_favorite,
            )
        if not row:
            raise HTTPException(status_code=500, detail="Failed to insert asset")
        return Asset(
            id=int(row['id']),
            name=row['name'],
            symbol=row['symbol'],
            price=float(row['price']),
            is_favorite=row['is_favorite'],
            created_at=str(row['created_at']),
        )
    except asyncpg.exceptions.UniqueViolationError as e:
        logger.error(f"Integrity error (duplicate symbol): {e}")
        raise HTTPException(status_code=409, detail="Symbol already exists")
    except asyncpg.exceptions.PostgresError as e:
        logger.error(f"DB error in add_asset: {e}")
        raise HTTPException(status_code=500, detail="Failed to add asset")
    except Exception as e:
        logger.error(f"Unexpected error in add_asset: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn and db_pool:
            await db_pool.release(conn)


@app.patch("/assets/{asset_id}/favorite", response_model=Asset)
@db_retry()
async def toggle_favorite(asset_id: int):
    try:
        conn = await get_connection()
        row = await conn.fetchrow("SELECT is_favorite FROM assets WHERE id=$1", asset_id)
        if not row:
            raise HTTPException(status_code=404, detail="Asset not found")
        new_fav = not row['is_favorite']
        updated = await conn.fetchrow(
            """
            UPDATE assets SET is_favorite=$1 WHERE id=$2 
            RETURNING id, name, symbol, price, is_favorite, created_at
            """,
            new_fav,
            asset_id,
        )
        await conn.commit()
        await db_pool.release(conn)
        if not updated:
            raise HTTPException(status_code=500, detail="Failed to update asset")
        return Asset(
            id=int(updated['id']),
            name=updated['name'],
            symbol=updated['symbol'],
            price=float(updated['price']),
            is_favorite=updated['is_favorite'],
            created_at=str(updated['created_at']),
        )
    except asyncpg.exceptions.PostgresError as e:
        logger.error(f"DB error in toggle_favorite: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle favorite")
    except Exception as e:
        logger.error(f"Unexpected error in toggle_favorite: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.on_event("shutdown")
async def shutdown():
    if db_pool:
        await db_pool.close()