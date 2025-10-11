from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import psycopg2
import os
import aiohttp
import asyncio
import logging
from dotenv import load_dotenv

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
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in .env")

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

# Helper: get DB connection per request
def get_connection():
    return psycopg2.connect(DATABASE_URL, sslmode="require")

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

# Common US stocks (expand as needed)
US_STOCKS = {
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 
    'NFLX', 'BABA', 'AMD', 'GOOG', 'JPM', 'V', 'JNJ'
}

# Updated live price fetch with Alpha Vantage GLOBAL_QUOTE
async def fetch_live_price(session: aiohttp.ClientSession, symbol: str, max_retries: int = 3) -> float | None:
    """Fetch live price in INR using Alpha Vantage GLOBAL_QUOTE (NSE/BSE/US) or CoinGecko (crypto)."""
    if not ALPHA_VANTAGE_KEY:
        logger.warning("No ALPHA_VANTAGE_KEY; using CoinGecko fallback for crypto only")
        if symbol.upper() in CRYPTO_MAP:
            return await _fetch_crypto_price(session, symbol)
        return None

    symbol_upper = symbol.upper()
    is_crypto = symbol_upper in CRYPTO_MAP

    if is_crypto:
        return await _fetch_crypto_price(session, symbol)

    # Determine ticker_sym and exchange
    if symbol_upper.endswith(('.NS', '.NSE')):
        ticker_sym = symbol_upper
        exchange = 'NSE'
        is_indian = True
    elif symbol_upper.endswith('.BSE'):
        ticker_sym = symbol_upper
        exchange = 'BSE'
        is_indian = True
    elif symbol_upper in US_STOCKS or (len(symbol_upper) <= 5 and symbol_upper.isalpha() and symbol_upper not in {'TCS', 'HDFC', 'INFY'}):  # Avoid common short Indian; expand US_STOCKS better in prod
        ticker_sym = symbol_upper
        exchange = 'NASDAQ'
        is_indian = False
    else:
        # Assume NSE for other alpha symbols
        ticker_sym = f"{symbol_upper}.NSE"
        exchange = 'NSE'
        is_indian = True

    for attempt in range(max_retries):
        try:
            # Async HTTP for GLOBAL_QUOTE
            url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker_sym}&apikey={ALPHA_VANTAGE_KEY}"
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    quote = data.get('Global Quote', {})
                    raw_price_str = quote.get('05. price', '0')
                    raw_price = float(raw_price_str) if raw_price_str else 0
                    if raw_price > 0:
                        if is_indian:
                            price = raw_price  # Direct INR for NSE/BSE
                        else:  # US: Convert to INR
                            usd_to_inr = await get_usd_to_inr_rate(session)
                            price = raw_price * usd_to_inr
                        logger.info(f"Fetched {symbol} ({exchange}, ticker: {ticker_sym}): ₹{price}")
                        return price

            # Rate limit check (Alpha returns 'Note' or error in text)
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
            logger.error(f"Failed to fetch {symbol} (ticker: {ticker_sym}): {e}")
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
@app.get("/assets", response_model=List[Asset])
async def get_assets():
    assets = []
    async with aiohttp.ClientSession() as session:
        try:
            with get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "SELECT id, name, symbol, price, is_favorite, created_at FROM assets ORDER BY id DESC"
                    )
                    rows = cur.fetchall()
                    
                    for i, r in enumerate(rows):
                        asset_id, name, symbol, stored_price, is_favorite, created_at = r
                        
                        live_price = await fetch_live_price(session, symbol)
                        if live_price:
                            with get_connection() as update_conn:
                                with update_conn.cursor() as update_cur:
                                    update_cur.execute("UPDATE assets SET price = %s WHERE id = %s", (live_price, asset_id))
                                    update_conn.commit()
                            logger.info(f"Updated {symbol} to ₹{live_price}")
                            price = live_price
                        else:
                            price = float(stored_price)
                        
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
                        
                        # 15s delay (Alpha: 5/min = 12s; buffer for safety)
                        if i < len(rows) - 1:
                            await asyncio.sleep(15)
            
            return assets
        except psycopg2.Error as e:
            logger.error(f"DB error in get_assets: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch assets")
        except Exception as e:
            logger.error(f"Unexpected error in get_assets: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

# /favorites (same as /assets but filtered)
@app.get("/favorites", response_model=List[Asset])
async def get_favorites():
    favorites = []
    async with aiohttp.ClientSession() as session:
        try:
            with get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "SELECT id, name, symbol, price, is_favorite, created_at FROM assets WHERE is_favorite=true ORDER BY id DESC"
                    )
                    rows = cur.fetchall()
                    
                    for i, r in enumerate(rows):
                        asset_id, name, symbol, stored_price, is_favorite, created_at = r
                        
                        live_price = await fetch_live_price(session, symbol)
                        if live_price:
                            with get_connection() as update_conn:
                                with update_conn.cursor() as update_cur:
                                    update_cur.execute("UPDATE assets SET price = %s WHERE id = %s", (live_price, asset_id))
                                    update_conn.commit()
                            price = live_price
                        else:
                            price = float(stored_price)
                        
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
                        
                        if i < len(rows) - 1:
                            await asyncio.sleep(15)
            
            return favorites
        except psycopg2.Error as e:
            logger.error(f"DB error in get_favorites: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch favorites")
        except Exception as e:
            logger.error(f"Unexpected error in get_favorites: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

# Other endpoints unchanged (root, health, post, patch)
@app.get("/")
def root():
    return {"message": "Backend is running", "endpoints": ["/health", "/assets", "/favorites"]}

@app.get("/health")
def health():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                return {"status": "ok", "db": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/assets", response_model=Asset)
def add_asset(asset: AssetCreate):
    if not asset.name.strip() or not asset.symbol.strip() or asset.price <= 0:
        raise HTTPException(status_code=400, detail="Invalid input: name/symbol required, price > 0")
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO assets (name, symbol, price, is_favorite) VALUES (%s, %s, %s, %s) RETURNING id, name, symbol, price, is_favorite, created_at",
                    (asset.name.strip(), asset.symbol.strip().upper(), asset.price, asset.is_favorite),
                )
                new_asset = cur.fetchone()
                if not new_asset:
                    raise HTTPException(status_code=500, detail="Failed to insert asset")
                conn.commit()
                return Asset(
                    id=new_asset[0],
                    name=new_asset[1],
                    symbol=new_asset[2],
                    price=float(new_asset[3]),
                    is_favorite=new_asset[4],
                    created_at=str(new_asset[5]),
                )
    except psycopg2.IntegrityError as e:
        logger.error(f"Integrity error (duplicate symbol): {e}")
        raise HTTPException(status_code=409, detail="Symbol already exists")
    except psycopg2.Error as e:
        logger.error(f"DB error in add_asset: {e}")
        raise HTTPException(status_code=500, detail="Failed to add asset")
    except Exception as e:
        logger.error(f"Unexpected error in add_asset: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.patch("/assets/{asset_id}/favorite", response_model=Asset)
def toggle_favorite(asset_id: int):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT is_favorite FROM assets WHERE id=%s", (asset_id,))
                row = cur.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Asset not found")
                new_fav = not row[0]
                cur.execute(
                    "UPDATE assets SET is_favorite=%s WHERE id=%s RETURNING id, name, symbol, price, is_favorite, created_at",
                    (new_fav, asset_id),
                )
                updated = cur.fetchone()
                if not updated:
                    raise HTTPException(status_code=500, detail="Failed to update asset")
                conn.commit()
                return Asset(
                    id=updated[0],
                    name=updated[1],
                    symbol=updated[2],
                    price=float(updated[3]),
                    is_favorite=updated[4],
                    created_at=str(updated[5]),
                )
    except psycopg2.Error as e:
        logger.error(f"DB error in toggle_favorite: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle favorite")
    except Exception as e:
        logger.error(f"Unexpected error in toggle_favorite: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")