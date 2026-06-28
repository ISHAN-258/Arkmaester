# Arkmaester

AI-powered study productivity platform (Pomodoro, planner, posture tracking, analytics).

## Stack

- **Frontend:** React 19 + Vite (PWA)
- **API:** Express on port `3001`
- **Database:** MongoDB Atlas via `mongodb` driver **7.2**

## Setup

### 1. MongoDB Atlas

1. Create a cluster and database user.
2. **Network Access:** allow your IP (or `0.0.0.0/0` for local dev only).
3. Copy the connection string and URL-encode special characters in the password.

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` and set `MONGODB_URI`:

```env
MONGODB_URI=mongodb+srv://ISHAN:YOUR_PASSWORD@arkmaester.1qat0ux.mongodb.net/arkmaester?retryWrites=true&w=majority&appName=ARKMAESTER
```

Never put `MONGODB_URI` in a `VITE_*` variable — it would be exposed in the browser.

### 3. Install and run

```bash
npm install
npm run dev
```

This starts:

- API at `http://localhost:3001` (`npm run dev:api`)
- Vite at `http://localhost:5173` with `/api` proxied to the API (`npm run dev:web`)

### 4. Verify

```bash
curl http://localhost:3001/api/health
```

Expected: `{"ok":true,"mongodb":true}`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + Vite together |
| `npm run dev:api` | API only |
| `npm run dev:web` | Vite only |
| `npm run start:api` | Production API |
| `npm run build` | Build frontend |

## Data model

All app data is stored in Atlas collection **`appdata`**, one document per key (`tasks`, `subjects`, `sessions`, etc.). The React app reads/writes through `src/utils/storage.js` → `PUT/GET /api/data/:key`.

To use **localStorage only** (offline, no Atlas): set `VITE_USE_API=false` in `.env`.
