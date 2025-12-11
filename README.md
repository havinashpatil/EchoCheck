# 🛡️ Echo-Check - Safety Monitoring Website

A complete safety monitoring system that helps users stay safe during trips by requiring periodic check-ins. If a check-in is missed, the system can alert trusted contacts via WhatsApp.

## ✨ Features

- **User Authentication**: Secure JWT-based authentication system
- **Trip Management**: Start and track trips with custom check-in intervals
- **Check-in System**: Periodic check-ins with GPS location tracking
- **SOS Emergency System**: Instant emergency alerts with WhatsApp deep links
- **Trusted Contacts**: Manage emergency contacts
- **Missed Check-in Scanner**: Automated detection of overdue check-ins
- **Modern Dark UI**: Beautiful, responsive, mobile-friendly interface

## 🏗️ Project Structure

```
echo-check/
├── backend/
│   ├── app.py              # Flask backend application
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── style.css           # Styling
│   └── app.js              # Frontend JavaScript
└── README.md               # This file
```

## 📋 Prerequisites

- **Python 3.8+** installed
- **MongoDB** installed and running (local or remote)
- **pip** (Python package manager)
- Modern web browser with geolocation support

## 🚀 Setup Instructions

### 1. Install MongoDB

#### Windows:
1. Download MongoDB from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will start automatically as a Windows service

#### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   
   **Windows:**
   ```bash
   venv\Scripts\activate
   ```
   
   **macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables:**
   
   Create a `.env` file in the `backend` directory:
   ```env
   JWT_SECRET=your-secret-key-change-in-production-make-it-long-and-random
   MONGO_URI=mongodb://localhost:27017/
   DATABASE_NAME=echocheck
   ```
   
   **Important:** Change `JWT_SECRET` to a secure random string in production!

6. **Run the Flask backend:**
   ```bash
   python app.py
   ```
   
   The backend will start on `http://localhost:5000`

### 3. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Open `index.html` in a web browser:**
   
   You can either:
   - **Option A:** Open directly in browser (double-click `index.html`)
   - **Option B:** Use a local server (recommended):
     
     **Python 3:**
     ```bash
     python -m http.server 8000
     ```
     
     **Node.js (if you have it):**
     ```bash
     npx http-server -p 8000
     ```
     
     Then open `http://localhost:8000` in your browser

3. **Update API URL (if needed):**
   
   If your backend is running on a different URL, edit `frontend/app.js` and change:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```
   to your backend URL.

## 🧪 Testing the Application

### 1. Create an Account
1. Open the frontend in your browser
2. Click on "Sign Up" tab
3. Enter your name, email, and password
4. Click "Sign Up"

### 2. Add Trusted Contacts
1. After logging in, scroll to "Trusted Contacts" section
2. Enter contact name, phone number, and optional email
3. Click "Add Contact"
4. Repeat for multiple contacts

### 3. Start a Trip
1. Enter a destination (e.g., "Home to Office")
2. Set check-in interval (default: 10 minutes)
3. Click "Start Trip"

### 4. Check-in
1. When prompted, click "I'm Safe — Check-in"
2. Allow location access when prompted
3. Your check-in will be recorded with GPS coordinates

### 5. Test SOS
1. Click "EMERGENCY SOS" button
2. Confirm the alert
3. Allow location access
4. Click the WhatsApp links to send emergency messages

### 6. Scan for Missed Check-ins
1. Click "Scan for Missed Check-ins" button
2. View any trips that have missed check-ins

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Add new contact
- `DELETE /api/contacts/:id` - Delete contact

### Trips
- `POST /api/trip` - Start new trip
- `GET /api/trip/active` - Get active trip

### Check-ins
- `POST /api/checkin` - Record check-in

### SOS
- `POST /api/sos` - Trigger emergency SOS

### Utilities
- `GET /api/scan_missed_checks` - Scan for missed check-ins
- `GET /api/health` - Health check

All protected endpoints require `Authorization: Bearer <token>` header.

## 🔒 Security Notes

1. **JWT Secret**: Always use a strong, random secret in production
2. **HTTPS**: Use HTTPS in production to secure data transmission
3. **CORS**: Configure CORS properly for production deployment
4. **MongoDB**: Secure your MongoDB instance with authentication
5. **Environment Variables**: Never commit `.env` file to version control

## 🌐 Deployment

### Backend Deployment (Heroku Example)

1. Create `Procfile` in backend directory:
   ```
   web: python app.py
   ```

2. Install gunicorn:
   ```bash
   pip install gunicorn
   ```

3. Update `Procfile`:
   ```
   web: gunicorn app:app
   ```

4. Set environment variables in Heroku dashboard

### Frontend Deployment

- Deploy static files to any hosting service (Netlify, Vercel, GitHub Pages, etc.)
- Update `API_BASE_URL` in `app.js` to point to your backend URL

## 📱 Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

**Note:** Geolocation requires HTTPS in production (or localhost for development).

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is running: `mongosh` or `mongo`
- Verify Python dependencies are installed
- Check if port 5000 is available

### Frontend can't connect to backend
- Verify backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Update `API_BASE_URL` in `app.js` if needed

### Geolocation not working
- Ensure HTTPS (or localhost)
- Check browser permissions for location access
- Verify GPS is enabled on mobile devices

### MongoDB connection errors
- Verify MongoDB is running
- Check `MONGO_URI` in `.env` file
- Ensure MongoDB is accessible on the specified port

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the GitHub repository.

---

**Stay Safe, Stay Connected! 🛡️**








