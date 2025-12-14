# 🚀 START HERE - Quick Setup

## ⚠️ IMPORTANT: Network Error Fix

If you're seeing "Network error. Please try again", it means the **backend is not running**. Follow these steps:

## Step 1: Start MongoDB

**Windows:**
- MongoDB usually starts automatically as a service
- If not, open Services (Win + R → `services.msc`) and start MongoDB

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongodb
```

## Step 2: Start the Backend

1. **Open a terminal/command prompt**

2. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

3. **Create virtual environment (first time only):**
   ```bash
   python -m venv venv
   ```

4. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

5. **Install dependencies (first time only):**
   ```bash
   pip install -r requirements.txt
   ```

6. **Create .env file (first time only):**
   - Copy `env.example.txt` to `.env`
   - Or create `.env` with:
     ```env
     JWT_SECRET=your-secret-key-change-in-production
     MONGO_URI=mongodb://localhost:27017/
     DATABASE_NAME=echocheck
     ```

7. **Start the Flask server:**
   ```bash
   python app.py
   ```

8. **You should see:**
   ```
   * Running on http://127.0.0.1:5000
   ```

   **⚠️ Keep this terminal open!** The backend must stay running.

## Step 3: Start the Frontend

1. **Open a NEW terminal/command prompt** (keep backend running!)

2. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

3. **Start a local web server:**
   ```bash
   python -m http.server 8000
   ```

4. **Open your browser and go to:**
   ```
   http://localhost:8000
   ```

## ✅ Success!

You should now see the Echo-Check login page without any network errors!

## 🆘 Still Getting Errors?

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed help.

## 📝 Quick Checklist

- [ ] MongoDB is running
- [ ] Backend is running on port 5000
- [ ] Frontend is accessed through `http://localhost:8000` (not file://)
- [ ] No errors in backend terminal
- [ ] No CORS errors in browser console (F12)

---

**Remember:** You need BOTH terminals running:
1. Backend terminal (Flask server)
2. Frontend terminal (web server)

If you close either one, the app won't work! 🚀









