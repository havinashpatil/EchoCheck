# 🚀 Quick Start Guide

## Prerequisites Check
- [ ] Python 3.8+ installed
- [ ] MongoDB installed and running
- [ ] pip installed

## Step 1: Backend Setup (5 minutes)

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - **Windows:** `venv\Scripts\activate`
   - **macOS/Linux:** `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create .env file:**
   - Copy `env.example.txt` to `.env`
   - Edit `.env` and set a secure `JWT_SECRET`

6. **Start MongoDB:**
   - Make sure MongoDB is running on your system

7. **Run the backend:**
   ```bash
   python app.py
   ```
   Backend will run on `http://localhost:5000`

## Step 2: Frontend Setup (2 minutes)

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Start a local server:**
   ```bash
   python -m http.server 8000
   ```

3. **Open in browser:**
   - Go to `http://localhost:8000`

## Step 3: Test the Application

1. **Sign Up:**
   - Click "Sign Up" tab
   - Enter name, email, password
   - Click "Sign Up"

2. **Add Contacts:**
   - Add at least one trusted contact
   - Enter name, phone number (with country code), optional email

3. **Start a Trip:**
   - Enter destination
   - Set check-in interval (default: 10 minutes)
   - Click "Start Trip"

4. **Test Check-in:**
   - Click "I'm Safe — Check-in"
   - Allow location access
   - Verify check-in is recorded

5. **Test SOS (optional):**
   - Click "EMERGENCY SOS"
   - Confirm alert
   - Check WhatsApp links are generated

## Troubleshooting

### Backend won't start?
- Check MongoDB is running: `mongosh` or check MongoDB service
- Verify port 5000 is available
- Check `.env` file exists and is configured

### Frontend can't connect?
- Verify backend is running on `http://localhost:5000`
- Check browser console for errors
- Verify CORS is enabled (should be by default)

### Geolocation not working?
- Use HTTPS or localhost (HTTP works on localhost)
- Check browser permissions
- Enable location services on device

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize the UI in `frontend/style.css`
- Extend the API in `backend/app.py`
- Deploy to production (see README.md)

---

**Happy Coding! 🎉**









