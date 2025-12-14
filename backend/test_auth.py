# Quick test script to verify authentication
from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'echocheck')

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
users_collection = db['users']

# Test: List all users
print("=== Existing Users ===")
users = list(users_collection.find({}, {'password': 0}))  # Don't show passwords
for user in users:
    print(f"Email: {user.get('email')}, Name: {user.get('name')}")

# Test: Create a test user
print("\n=== Creating Test User ===")
test_email = "test@example.com"
test_password = "test123"

# Check if user exists
existing = users_collection.find_one({'email': test_email})
if existing:
    print(f"User {test_email} already exists")
    # Test password verification
    stored_pw = existing['password']
    if isinstance(stored_pw, str):
        stored_pw = stored_pw.encode('utf-8')
    result = bcrypt.checkpw(test_password.encode('utf-8'), stored_pw)
    print(f"Password verification: {'✓ SUCCESS' if result else '✗ FAILED'}")
else:
    print(f"Creating new user: {test_email}")
    hashed = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt())
    users_collection.insert_one({
        'name': 'Test User',
        'email': test_email,
        'password': hashed,
    })
    print("User created successfully!")

print("\n=== Test Complete ===")









