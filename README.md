# Asset Pulse 🚀

Full-stack app to track stocks/crypto with live prices, favorites, and NeonDB storage.

## Tech Stack
- Frontend: Next.js + Tailwind CSS
- Backend: FastAPI (Python)
- DB: NeonDB (Postgres)
- Deployment: Vercel (FE) + Render (BE)

## Live Demo
- Frontend: https://asset-pulse-two.vercel.app/
- Backend: https://asset-pulse.onrender.com

## Local Setup
1. Clone: `git clone <repo> && cd asset-pulse`
2. Backend: `cd backend && pip install -r requirements.txt && cp .env.example .env && uvicorn main:app --reload`
3. DB: Sign up at neon.tech, update DATABASE_URL in .env, run CREATE TABLE SQL.
4. Frontend: `cd ../frontend && cp .env.local.example .env.local && npm install && npm run dev`
5. Test: Add asset via form, toggle favorite.

## API Usage
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /assets | List all assets |
| POST | /assets | Add asset (JSON: {name, symbol, price, is_favorite}) |
| PATCH | /assets/:id/favorite | Toggle favorite |
| GET | /favorites | List favorites only |

## Features
- Live prices via Alpha Vantage (stocks) / CoinGecko (crypto, e.g., BTC, ETH, SOL).
- Responsive UI with Tailwind.
- Error handling: 400/404/500 responses.

## Future Ideas
- Real-time updates (WebSockets).
- Charts for price history.

Built with ❤️ using AI assistance for code iteration.
