import asyncio
from app.db.session import init_db, AsyncSessionLocal
from app.models.database import Patient

async def seed_data():
    await init_db()
    async with AsyncSessionLocal() as db:
        patients = [
            Patient(name="John Doe", age=65, gender="Male", bed_number="A1", status="Stable"),
            Patient(name="Jane Smith", age=72, gender="Female", bed_number="A2", status="Critical"),
            Patient(name="Robert Brown", age=58, gender="Male", bed_number="B1", status="Stable"),
            Patient(name="Emily Davis", age=45, gender="Female", bed_number="B2", status="Recovering"),
            Patient(name="Michael Wilson", age=80, gender="Male", bed_number="C1", status="Stable"),
        ]
        db.add_all(patients)
        await db.commit()
    print("Database seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
