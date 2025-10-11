# Asset Pulse 🚀

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-blue?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-green?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-orange?style=flat&logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/Render-Deployed-red?style=flat&logo=render)](https://render.com)

A sleek full-stack web application for tracking financial assets like US stocks and cryptocurrencies. Users can add assets, view live prices (fetched in INR), toggle favorites, and manage a personalized dashboard. Built with modern tools for a responsive, real-time feel—perfect for quick portfolio glances!

## ✨ Key Features
- **Dashboard & Favorites View**: Clean, responsive list of assets with real-time price updates, symbols, and one-click favorite toggling (⭐).
- **Add Assets Easily**: Simple form to input name, symbol, and initial price—submits securely to the backend.
- **Live Price Fetching**:
  - **US Stocks**: Powered by Alpha Vantage API (e.g., AAPL, TSLA, NVDA). Prices converted to INR using real-time exchange rates.
  - **Cryptocurrencies**: Fallback to CoinGecko API (e.g., BTC, ETH, SOL, USDT, DOGE, ADA). Supports top 10+ coins with USD-to-INR conversion.
  - Note: Currently optimized for US stocks and major cryptos only—no Indian stock support to keep API calls efficient and reliable.
- **Data Persistence**: All assets stored in a scalable Postgres database (NeonDB) with unique symbols to prevent duplicates.
- **Error-Resilient**: Handles API rate limits, invalid symbols, and DB errors gracefully (e.g., falls back to stored prices).
- **Responsive UI**: Tailwind CSS for mobile-first design—works seamlessly on desktop, tablet, or phone.

## 🛠 Tech Stack
| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14 (App Router) + React + Tailwind CSS | Dynamic UI, API integration, responsive layouts |
| **Backend** | FastAPI (Python 3.12) + Pydantic | RESTful APIs, async price fetching, validation |
| **Database** | NeonDB (Postgres) | Serverless storage for assets and favorites |
| **APIs** | Alpha Vantage + CoinGecko + ExchangeRate-API | Live US stock/crypto prices + USD-INR conversion |
| **Deployment** | Vercel (Frontend) + Render (Backend) | Serverless hosting with auto-deploys from GitHub |
| **Tools** | dotenv for env vars, psycopg2 for DB, aiohttp for async HTTP | Secure configs, reliable connections |

## 🚀 Live Demo
Experience the app in action!

- **Frontend Dashboard**: [Vercel](https://asset-pulse-two.vercel.app/) – Add assets like "Apple" (AAPL) or "Bitcoin" (BTC), toggle favorites, and watch prices update!
- **Favorites Page**: [Vercel](https://asset-pulse-two.vercel.app/favorites) – Filtered view for starred assets.
- **Backend APIs**: [Render](https://asset-pulse.onrender.com/docs) – Interactive Swagger UI for testing endpoints (e.g., POST /assets).

## 🏗 Local Setup
Get the project running in under 5 minutes! Requires Node.js 18+, Python 3.12+, and Git.

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/Abhay-hack/Asset-Pulse.git
   cd asset-pulse
   ```
2. **Set Up Backend** (FastAPI):
     ```bash
     cd backend
     pip install -r requirements.txt  #install fastapi,uvicorn,pydantic,psycopg2-binary,python-dotenv,aiohttp,yfinance==0.2.40,requests==2.31.0,asyncio,alpha-vantage==2.3.1
     cp .env.example .env
     ```
    - Backend runs at `http://localhost:8000`. Test with `/docs` for Swagger.

3. **Database Setup** (NeonDB):
    - Sign up for free at [neon.tech](https://neon.tech) → Create a project → Copy the connection string (e.g., `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db`).
    - Update `DATABASE_URL` in `backend/.env`.
    - Run this SQL in Neon's console or via `psql $DATABASE_URL`:
    ```sql
    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      symbol TEXT UNIQUE NOT NULL,
      price NUMERIC NOT NULL DEFAULT 0,
      is_favorite BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```
4. **Set Up Frontend** (Next.js):
   ```bash
   cd frontend
   cp .env.local.example .env.local
   # Edit .env.local: Set NEXT_PUBLIC_API_URL=http://localhost:8000
   npm install
   npm run dev
   ```
5. **Test the App**:
   - Add an asset (e.g., Name: "Tesla", Symbol: "TSLA", Price: 250).
   - Visit /assets – prices should auto-update to live INR values.
   - Toggle favorite and check /favorites.
   - Errors? Check backend logs for API/DB issues.

## Environment Variables
See .env.example (backend) and .env.local.example (frontend) for templates:
  ```bash
    DATABASE_URL: # NeonDB connection string (required).
    ALPHA_VANTAGE_KEY: # Free API key for US stocks (optional; crypto fallback works without).
    NEXT_PUBLIC_API_URL: # Backend base URL (e.g., http://localhost:8000 locally).
  ```

## 📚 API Reference
Secure, typed endpoints with Pydantic validation. All responses in JSON.
  | Method | Endpoint | Description |
  |--------|----------|-------------|
  | GET | /assets | List all assets |
  | POST | /assets | Add asset (JSON: {name, symbol, price, is_favorite}) |
  | PATCH | /assets/:id/favorite | Toggle favorite |
  | GET | /favorites | List favorites only |

  - Error Responses: Standard HTTP codes (400: Bad Request, 404: Not Found, 409: Duplicate Symbol, 500: Server Error).
  - Rate Limiting: Built-in delays for Alpha Vantage compliance.

## 🔮 Future Enhancements
  - Real-Time Updates: Integrate WebSockets (e.g., Socket.io) for instant price pushes.
  - Price History Charts: Add Recharts for line graphs of daily trends.
  - User Auth: JWT sessions for multi-user portfolios.
  - More Assets: Expand to international stocks or commodities with additional APIs.
  - Mobile App: React Native wrapper for on-the-go tracking.

## 🤝 Contributing
Pull requests welcome! Fork the repo, create a feature branch (git checkout -b feature/amazing-feature), and submit a PR. Focus on clean code, tests, and docs.
1. Fork & clone.
2. Install deps and run locally.
3. Commit changes (git commit -m "Add feature: X").
4. Push & open PR.

### 📄 License
MIT License – feel free to use, modify, and distribute.

⭐ Star the repo if it sparks joy! Questions? Open an issue or ping me. Happy tracking! 📈
