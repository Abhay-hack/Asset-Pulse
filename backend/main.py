from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in .env")

# Pydantic models
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
        return {"status": "error", "message": str(e)}

@app.get("/assets", response_model=List[Asset])
def get_assets():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name, symbol, price, is_favorite, created_at FROM assets ORDER BY id DESC"
            )
            rows = cur.fetchall()
            return [
                Asset(
                    id=r[0],
                    name=r[1],
                    symbol=r[2],
                    price=float(r[3]),
                    is_favorite=r[4],
                    created_at=str(r[5]),
                )
                for r in rows
            ]

@app.post("/assets", response_model=Asset)
def add_asset(asset: AssetCreate):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO assets (name, symbol, price, is_favorite) VALUES (%s, %s, %s, %s) RETURNING id, name, symbol, price, is_favorite, created_at",
                (asset.name, asset.symbol, asset.price, asset.is_favorite),
            )
            new_asset = cur.fetchone()
            conn.commit()
            return Asset(
                id=new_asset[0],
                name=new_asset[1],
                symbol=new_asset[2],
                price=float(new_asset[3]),
                is_favorite=new_asset[4],
                created_at=str(new_asset[5]),
            )

@app.patch("/assets/{asset_id}/favorite", response_model=Asset)
def toggle_favorite(asset_id: int):
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
            conn.commit()
            return Asset(
                id=updated[0],
                name=updated[1],
                symbol=updated[2],
                price=float(updated[3]),
                is_favorite=updated[4],
                created_at=str(updated[5]),
            )

@app.get("/favorites", response_model=List[Asset])
def get_favorites():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name, symbol, price, is_favorite, created_at FROM assets WHERE is_favorite=true ORDER BY id DESC"
            )
            rows = cur.fetchall()
            return [
                Asset(
                    id=r[0],
                    name=r[1],
                    symbol=r[2],
                    price=float(r[3]),
                    is_favorite=r[4],
                    created_at=str(r[5]),
                )
                for r in rows
            ]

