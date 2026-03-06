import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.database import Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://icu_user:icu_password@db/icu_db")

engine = create_async_engine(DATABASE_URL, echo=True)
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
