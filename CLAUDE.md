# CLAUDE.md — The Grinding Hour

## Purpose
Labor tracking dashboard for a Kia Certified Master Technician. Consolidates three Tekion data sources (Tech Report, RO List, Labor Log) to track flag hours, efficiency, pay type breakdown, and discrepancies.

## Quick Start
```powershell
# Backend (port 8001)
cd projects/grinding-hour/backend
.venv\Scripts\Activate.ps1
python main.py

# Frontend (port 5174)
cd projects/grinding-hour/frontend
npm run dev
```

Browser: http://localhost:5174 — login password: `Accord#25`

**Note:** Do NOT use `start.ps1` — it looks for `backend\venv` but the actual venv is `backend\.venv`.

## Architecture
- Backend: FastAPI + uvicorn, port 8001 — routers in `backend/routers/`
- Frontend: React + Vite + TypeScript + Tailwind, port 5174
- Database: SQLite at `backend/data/grinddata.db` — NEVER commit this file to git
- Parsers: `backend/parsers/` — tech_report.py, ro_list.py, labor_log.py
- Auth: password check in `backend/auth.py` — NEVER disable

## Data Source Architecture
- Tekion Tech Report / RO List → `source='tekion'` in Task model
- Manual Labor Log → `source='manual'` in Task model
- Dashboard filters: Tekion only (`Task.source == 'tekion'`)
- Audit tab: compares Tekion vs Manual per date

## Critical Rules
- Database is at `backend/data/grinddata.db` — NEVER in `backend/` root
- The model is `WorkSession` NOT `Session` — `Session` shadows SQLAlchemy's ORM Session
- Backup DB before any schema change: `cp backend/data/grinddata.db backend/data/grinddata.db.backup-<date>`
- Tekion sheet names are dynamic (e.g., `Flag_ANTHONY TANNER_2026`) — parsers use prefix matching

## Current Stage
See `BarahdurVault/01 Projects/WIP/The Grinding Hour/Overview.md` for current stage and status.
