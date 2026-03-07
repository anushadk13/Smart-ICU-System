import os
from dotenv import load_dotenv

# Load .env file for local development
load_dotenv()
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.database import Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://icu_user:icu_password@db/icu_db")

# Clean the URL if it's from a copy-pasted 'psql' command
if DATABASE_URL.startswith("psql '") and DATABASE_URL.endswith("'"):
    DATABASE_URL = DATABASE_URL[6:-1]
elif DATABASE_URL.startswith("psql "):
    DATABASE_URL = DATABASE_URL[5:]

# Ensure SQLAlchemy uses the asyncpg driver
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Strip incompatible query parameters for asyncpg (sslmode, channel_binding)
if "?" in DATABASE_URL:
    base_url, query = DATABASE_URL.split("?", 1)
    params = query.split("&")
    # asyncpg uses 'ssl' instead of 'sslmode'
    # For many hosts like Neon, the simplest way to ensure SSL is enabled in asyncpg 
    # while avoiding errors is to strip these and let the driver handle it or pass 'ssl=True'
    filtered_params = [p for p in params if not p.startswith(("sslmode=", "channel_binding="))]
    if filtered_params:
        DATABASE_URL = f"{base_url}?{'&'.join(filtered_params)}"
    else:
        DATABASE_URL = base_url

engine = create_async_engine(
    DATABASE_URL, 
    echo=True,
    connect_args={"ssl": True} if "neon.tech" in DATABASE_URL else {}
)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        # Import models here to ensure they are registered
        from app.models.database import Patient, VitalReading, Alert
        await conn.run_sync(Base.metadata.create_all)
