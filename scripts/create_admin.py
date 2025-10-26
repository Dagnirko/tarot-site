#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, '/app/backend')

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'tarot_astro_site')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check if admin exists
    existing_admin = await db.users.find_one({"username": "admin"})
    if existing_admin:
        print("Admin user already exists!")
        return
    
    # Create admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "username": "admin",
        "email": "admin@example.com",
        "password_hash": pwd_context.hash("admin123"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(admin_user)
    print("✅ Admin user created successfully!")
    print("Username: admin")
    print("Password: admin123")
    print("\n⚠️  Please change the password after first login!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
