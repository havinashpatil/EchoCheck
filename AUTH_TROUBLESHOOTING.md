# 🔐 Authentication Troubleshooting

## "Invalid credentials" Error

If you're seeing "Invalid credentials" when trying to login, follow these steps:

### ✅ Step 1: Make sure you've signed up first

**You must create an account before you can login!**

1. Click on the **"Sign Up"** tab (not Login)
2. Enter:
   - Your name
   - Your email
   - Your password
3. Click **"Sign Up"**

### ✅ Step 2: Verify your credentials

**Common mistakes:**
- ✗ Typo in email address
- ✗ Wrong password
- ✗ Case sensitivity (email should match exactly)
- ✗ Extra spaces before/after email or password

### ✅ Step 3: Test with the test account

A test account has been created for you:

- **Email:** `test@example.com`
- **Password:** `test123`

Try logging in with these credentials to verify the system is working.

### ✅ Step 4: Reset/Create a new account

If you're still having issues:

1. **Clear browser storage:**
   - Open browser console (F12)
   - Go to Application/Storage tab
   - Clear Local Storage

2. **Create a new account:**
   - Use the Sign Up form
   - Use a simple email like `yourname@test.com`
   - Use a simple password (at least 6 characters)

3. **Try logging in again**

### ✅ Step 5: Check backend logs

Look at the terminal where the backend is running. You should see:
- Login requests coming in
- Any error messages

### 🔧 Debug Steps

1. **Check if user exists:**
   ```powershell
   cd backend
   python test_auth.py
   ```
   This will show all registered users (without passwords)

2. **Verify MongoDB is running:**
   - Check Windows Services for MongoDB
   - Or run: `mongosh` to connect to MongoDB

3. **Check backend is running:**
   ```powershell
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"ok"}`

### 📝 Common Issues

#### Issue: "User already exists" when signing up
**Solution:** Use a different email, or if this is your email, use the Login tab instead.

#### Issue: Can't remember password
**Solution:** Create a new account with a different email (password reset feature not implemented yet).

#### Issue: Login works but then shows errors
**Solution:** Check browser console (F12) for JavaScript errors. Make sure backend is still running.

### 🆘 Still Not Working?

1. **Check browser console (F12)** for error messages
2. **Check backend terminal** for error messages
3. **Verify:**
   - Backend is running on port 5000
   - MongoDB is running
   - You're using Sign Up first, then Login

---

## Quick Test

Try this test account:
- **Email:** `test@example.com`
- **Password:** `test123`

If this works, the system is fine - you just need to create your own account or use correct credentials.

If this doesn't work, there's a system issue - check backend logs and MongoDB connection.

---

**Remember:** Always use **Sign Up** first before trying to **Login**! 🚀








