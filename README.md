# The Grinding Hour

Labor and efficiency tracking dashboard for Kia Certified Master Technicians. Consolidates Tekion Tech Reports, RO Lists, and manual Labor Logs into a single source of truth with discrepancy auditing.

**Version:** 2.0.0

## Features

- **Dashboard** — YTD flag hours, efficiency %, income projection, monthly/weekly breakdowns
- **Upload Pipeline** — Import Tekion Tech Reports, RO Lists, and manual Labor Logs (xlsx)
- **Audit Tab** — Date-by-date comparison between Tekion-recorded and manually-tracked hours
- **Source Isolation** — Dashboard shows only Tekion-verified hours; manual data available in audit only

## Tech Stack

- **Backend:** FastAPI + SQLAlchemy + SQLite (Python 3.11)
- **Frontend:** Vite + React + TypeScript + Tailwind CSS
- **Auth:** JWT (8-hour tokens)

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Windows (PowerShell)
```powershell
.\start.ps1
```

### Manual

**Backend:**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```
Runs on http://localhost:8001

**Frontend:**
```powershell
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5174

## Configuration

Copy `.env.example` to `.env`:

```
GRINDING_HOUR_PASSWORD=your-password
SECRET_KEY=your-random-secret-key
```

## Data Import Workflow

1. Log in at http://localhost:5174
2. Go to **Upload** tab
3. Import files in order:
   - **Tech Report** (xlsx) — Tekion technician report (2024–2026)
   - **RO List** (xlsx) — Tekion RO list (2023)
   - **Labor Log** (xlsx) — Manual 2026 Kia tracking sheet
4. View **Dashboard** for Tekion-verified stats
5. View **Audit** to compare Tekion vs manual hours by date

## Project Structure

```
grinding-hour/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py           # WorkSession, Task, Export
│   ├── auth.py
│   ├── routers/
│   │   ├── stats.py        # Dashboard + audit endpoints
│   │   └── upload.py       # File import endpoints
│   └── parsers/
│       ├── tech_report.py  # Tekion Tech Report parser
│       ├── ro_list.py      # Tekion RO List parser
│       └── labor_log.py    # Manual Labor Log parser
├── frontend/src/
│   ├── pages/              # Dashboard, Upload, Audit, Login
│   ├── components/         # Layout, charts, summary cards
│   └── api/client.ts
├── data/                   # User data (gitignored)
├── .env.example
├── start.ps1
└── start.sh
```

## License

MIT
