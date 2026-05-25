"""
The Grinding Hour — FastAPI Backend
Labor and efficiency tracking application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import date
from routers import stats, upload, export, manual, rates
from database import engine, SessionLocal
from models import Base, LaborRate

SEED_RATES = [
    {"effective_date": date(2020, 11, 1), "rate": 24.0, "notes": "Starting rate"},
    {"effective_date": date(2022,  7, 1), "rate": 32.0, "notes": "Raise"},
    {"effective_date": date(2024,  1, 1), "rate": 36.0, "notes": "Raise"},
    {"effective_date": date(2026,  5, 1), "rate": 37.5, "notes": "Raise"},
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(LaborRate).count() == 0:
            for row in SEED_RATES:
                db.add(LaborRate(**row))
            db.commit()
    finally:
        db.close()
    yield

app = FastAPI(
    title="The Grinding Hour API",
    description="Labor tracking and efficiency dashboard",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(stats.router)
app.include_router(upload.router)
app.include_router(export.router)
app.include_router(manual.router)
app.include_router(rates.router)

@app.get("/")
async def root():
    return {
        "message": "The Grinding Hour API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
