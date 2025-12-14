# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### ❌ "Network error. Please try again" or "Cannot connect to backend"

This error means the frontend cannot communicate with the Flask backend. Follow these steps:

#### Step 1: Check if Backend is Running

1. **Open a terminal/command prompt**
2. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```
3. **Check if Flask is running:**
   - You should see a terminal window with Flask running
   - Look for messages like: `* Running on http://127.0.0.1:5000`

#### Step 2: Start the Backend

If the backend is not running:

1. **Activate your virtual environment (if using one):**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

2. **Start the Flask server:**
   ```bash
   python app.py
   ```

3. **You should see:**
   ```
   * Running on http://127.0.0.1:5000
   * Debug mode: on
   ```

#### Step 3: Check MongoDB is Running

The backend requires MongoDB to be running:

**Windows:**
- Open Services (Win + R, type `services.msc`)
- Look for "MongoDB" service
- Make sure it's running

**macOS:**
```bash
brew services list
# MongoDB should be listed as "started"
```

**Linux:**
```bash
sudo systemctl status mongodb
# Should show "active (running)"
```

**Start MongoDB if not running:**
```bash
# Windows (usually starts automatically)
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

#### Step 4: Verify Backend is Accessible

1. **Open your browser**
2. **Go to:** `http://localhost:5000/api/health`
3. **You should see:** `{"status":"ok"}`

If you don't see this, the backend is not running correctly.

#### Step 5: Check Frontend Setup

1. **Make sure you're opening the frontend through a web server:**
   - ❌ **Don't:** Open `index.html` directly (file://)
   - ✅ **Do:** Use a local server

2. **Start a local server:**
   ```bash
   cd frontend
   python -m http.server 8000
   ```

3. **Open:** `http://localhost:8000`

#### Step 6: Check Port Conflicts

If port 5000 is already in use:

1. **Find what's using port 5000:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # macOS/Linux
   lsof -i :5000
   ```

2. **Option A:** Stop the other application
3. **Option B:** Change the backend port in `backend/app.py`:
   ```python
   app.run(debug=True, port=5001)  # Change to 5001
   ```
   Then update `frontend/app.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:5001/api';
   ```

---

### ❌ "MongoDB connection error" or Database errors

#### Solution 1: Verify MongoDB is Running
- Follow Step 3 above

#### Solution 2: Check MongoDB Connection String

1. **Check your `.env` file in the backend folder:**
   ```env
   MONGO_URI=mongodb://localhost:27017/
   DATABASE_NAME=echocheck
   ```

2. **Test MongoDB connection:**
   ```bash
   # Windows
   mongosh
   
   # macOS/Linux
   mongo
   ```

3. **If MongoDB requires authentication, update `.env`:**
   ```env
   MONGO_URI=mongodb://username:password@localhost:27017/
   ```

---

### ❌ "Location permission denied" or Geolocation not working

#### Solution 1: Enable Location Permissions

1. **Check browser permissions:**
   - Click the lock icon in the address bar
   - Enable "Location" permission

2. **For Chrome:**
   - Settings → Privacy and Security → Site Settings → Location
   - Make sure location is enabled

#### Solution 2: Use HTTPS or Localhost

- Geolocation works on:
  - ✅ `http://localhost` (development)
  - ✅ `https://` (production)
  - ❌ `file://` (doesn't work)

Make sure you're using a local server, not opening the HTML file directly.

---

### ❌ "CORS error" in browser console

#### Solution: Enable CORS in Backend

The backend already has CORS enabled with `flask-cors`. If you still see CORS errors:

1. **Check `backend/app.py` has:**
   ```python
   from flask_cors import CORS
   CORS(app)
   ```

2. **Make sure `flask-cors` is installed:**
   ```bash
   pip install flask-cors
   ```

---

### ❌ "Module not found" or Import errors

#### Solution: Install Dependencies

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install requirements:**
   ```bash
   pip install -r requirements.txt
   ```

3. **If using virtual environment, activate it first:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

---

### ❌ Backend starts but crashes immediately

#### Check Error Messages

1. **Look at the terminal output** for error messages
2. **Common issues:**
   - Missing `.env` file → Create it from `env.example.txt`
   - MongoDB not running → Start MongoDB
   - Port already in use → Change port or stop other application
   - Missing dependencies → Run `pip install -r requirements.txt`

---

### ❌ Frontend shows "Backend Connection Error" banner

This banner appears when the frontend cannot connect to the backend.

**Quick fixes:**
1. ✅ Start the backend: `cd backend && python app.py`
2. ✅ Check MongoDB is running
3. ✅ Verify backend is on `http://localhost:5000`
4. ✅ Check you're using a web server (not file://)

---

### ❌ "JWT token expired" or Authentication errors

#### Solution: Clear Local Storage and Re-login

1. **Open browser console (F12)**
2. **Run:**
   ```javascript
   localStorage.clear()
   ```
3. **Refresh the page**
4. **Sign up or login again**

---

## Still Having Issues?

### Check Browser Console

1. **Open Developer Tools (F12)**
2. **Go to Console tab**
3. **Look for error messages**
4. **Share the error messages for further help**

### Check Backend Logs

1. **Look at the terminal where Flask is running**
2. **Check for error messages**
3. **Common errors:**
   - Database connection issues
   - Missing environment variables
   - Port conflicts

### Verify Installation

1. **Python version:**
   ```bash
   python --version
   # Should be 3.8 or higher
   ```

2. **MongoDB version:**
   ```bash
   mongod --version
   # Should show MongoDB version
   ```

3. **Pip packages:**
   ```bash
   pip list
   # Should show Flask, pymongo, etc.
   ```

---

## Quick Diagnostic Commands

Run these to check your setup:

```bash
# Check Python
python --version

# Check MongoDB (if installed)
mongod --version

# Check if port 5000 is in use
# Windows
netstat -ano | findstr :5000
# macOS/Linux
lsof -i :5000

# Test backend health endpoint (after starting backend)
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}
```

---

## Getting Help

If you're still stuck:

1. **Check the error messages** in browser console and backend terminal
2. **Verify all prerequisites** are installed
3. **Make sure MongoDB is running**
4. **Ensure backend is started** before opening frontend
5. **Use a local web server** (not file://)

---

**Remember:** The backend MUST be running before the frontend can work! 🚀









