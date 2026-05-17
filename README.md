# The Grinding Hour

Labor and efficiency tracking application for automotive technicians.

## Tech Stack

**Backend:**
- FastAPI (Python)
- SQLite database
- JWT authentication

**Frontend:**
- Vite + React + TypeScript
- Tailwind CSS
- Real-time labor tracking UI

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Windows (PowerShell)
```powershell
.\start.ps1
```

### macOS / Linux (Bash)
```bash
bash start.sh
```

The startup scripts will:
1. Create and activate Python virtual environment
2. Install backend dependencies
3. Install frontend dependencies
4. Start backend server on http://localhost:8001
5. Start frontend development server on http://localhost:5174
6. Open your browser automatically

## Ports

- **Backend API:** http://localhost:8001
- **Frontend:** http://localhost:5174

## First Run

1. Launch the application (using `start.ps1` or `start.sh`)
2. Log in with your configured password (from `.env`)
3. Create a work session
4. Log hours and tasks
5. Export labor records as needed

## Configuration

Copy `.env.example` to `.env` and configure:
- `GRINDING_HOUR_PASSWORD` — Your session password
- `HOURLY_RATE` — Labor rate (default 32.00)
- `SECRET_KEY` — JWT signing key (generate a secure random string)

## Project Structure

```
grinding-hour/
├── backend/              # FastAPI server
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── auth.py
│   ├── backup.py
│   ├── routers/         # API endpoints
│   ├── parsers/         # Data import parsers
│   └── requirements.txt
├── frontend/            # Vite + React app
│   ├── src/
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── data/               # User data (gitignored)
│   ├── uploads/
│   ├── exports/
│   └── backups/
├── .env.example        # Configuration template
├── .gitignore
├── start.ps1          # Windows startup
└── start.sh           # Unix startup
```

## Development

### Backend only
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Frontend only
```bash
cd frontend
npm install
npm run dev
```

## License

MIT
