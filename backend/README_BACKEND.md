# Backend Setup - Quick Start

## ✅ Dependencies Installed!

All required packages have been installed:
- Flask 3.0.0
- flask-cors 4.0.0
- pymongo 4.6.0
- bcrypt 4.1.2
- PyJWT 2.8.0
- python-dotenv 1.0.0

## 🚀 Starting the Backend

### Option 1: Using the Startup Script (Windows)
```powershell
.\start_backend.ps1
```

### Option 2: Manual Start
```powershell
python app.py
```

The backend will start on `http://localhost:5000`

## ⚙️ Configuration

The `.env` file has been created. You can edit it to change:
- `JWT_SECRET` - Secret key for JWT tokens (change in production!)
- `MONGO_URI` - MongoDB connection string
- `DATABASE_NAME` - Database name

## 🔍 Verify Backend is Running

Open your browser and go to:
```
http://localhost:5000/api/health
```

You should see: `{"status":"ok"}`

## ⚠️ Before Starting

1. **Make sure MongoDB is running:**
   - Check Windows Services for "MongoDB"
   - Or install MongoDB if not installed

2. **Keep the terminal open:**
   - The backend must stay running for the frontend to work
   - Press `Ctrl+C` to stop

## 🐛 Troubleshooting

If you get errors:
1. Check MongoDB is running
2. Verify `.env` file exists
3. Check port 5000 is not in use
4. See main `TROUBLESHOOTING.md` for more help

---

**Ready to start? Run: `python app.py`** 🚀








