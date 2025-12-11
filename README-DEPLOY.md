# Deploy EchoCheck to Render.com

This guide walks you through deploying the **EchoCheck** app (Flask backend + static frontend) to Render.com for **free public access**.

---

## Prerequisites

1. **GitHub Account** — Push your repo to GitHub (free).
2. **Render Account** — Sign up at https://render.com (free tier available).
3. **MongoDB** — Use MongoDB Atlas (free tier: https://www.mongodb.com/cloud/atlas) or configure `MONGO_URI` from your existing database.

---

## Step 1: Push Code to GitHub

### 1.1 Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `echocheck`)
3. **Do NOT initialize README** (we'll push existing code)

### 1.2 Push Your Code

```powershell
cd C:\Users\ADMIN\OneDrive\Desktop\EchoCheck
git init
git add .
git commit -m "Initial commit: EchoCheck app"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/echocheck.git
git push -u origin main
```

(Replace `<YOUR_USERNAME>` with your GitHub username.)

---

## Step 2: Set Up MongoDB Atlas (if needed)

If you don't have a database yet:

1. Go to https://www.mongodb.com/cloud/atlas
2. **Sign up** (free tier = 512MB storage, 3 replica set)
3. Create a **Cluster** (free tier)
4. Go to **Database Access** → Create a user with a strong password
5. Go to **Network Access** → Add IP `0.0.0.0/0` (allow all; for production, restrict to Render's IP)
6. In **Clusters**, click **Connect** → Get your **connection string**:
   - Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

---

## Step 3: Deploy Backend to Render

### 3.1 Create a Web Service

1. Log in to https://render.com
2. Click **+ New** → **Web Service**
3. Select **GitHub** and authorize Render to access your repo
4. Select your `echocheck` repo
5. Fill in:
   - **Name:** `echocheck-backend` (or any name)
   - **Root Directory:** `backend` (important!)
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app -w 4 -b 0.0.0.0:$PORT --timeout 120`
   - **Instance Type:** Free (or Starter for better performance)
   - **Region:** Pick closest to your users

### 3.2 Add Environment Variables

In the **Environment** section of the service, add:

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority` |
| `DATABASE_NAME` | `echocheck` |
| `JWT_SECRET` | Generate a long random string (e.g., `openssl rand -hex 32` or paste a random string like `your-super-secret-key-min-32-chars-long-random`) |
| `TWILIO_ACCOUNT_SID` | (Optional) Your Twilio SID if you have one |
| `TWILIO_AUTH_TOKEN` | (Optional) Your Twilio token |
| `TWILIO_PHONE_NUMBER` | (Optional) Your Twilio phone number |
| `TWILIO_WHATSAPP_NUMBER` | (Optional) Your Twilio WhatsApp number |

6. Click **Create Web Service**

**Wait for deployment** (2–5 minutes). Once live, Render will give you a URL like:
```
https://echocheck-backend.onrender.com
```

---

## Step 4: Deploy Frontend to Render

### 4.1 Create a Static Site

1. In Render, click **+ New** → **Static Site**
2. Select your `echocheck` repo again
3. Fill in:
   - **Name:** `echocheck-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** (leave blank)
   - **Publish Directory:** `.` (current folder)

4. Click **Create Static Site**

**Wait for deployment**. You'll get a URL like:
```
https://echocheck-frontend.onrender.com
```

---

## Step 5: Update Frontend to Use Backend URL

The frontend needs to know where your backend is running.

### 5.1 Update `frontend/app.js`

Open `frontend/app.js` and find line ~1:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Replace with your Render backend URL:

```javascript
const API_BASE_URL = 'https://echocheck-backend.onrender.com/api';
```

(Use the URL from Step 3.2 above + `/api`)

### 5.2 Push Changes to GitHub

```powershell
cd C:\Users\ADMIN\OneDrive\Desktop\EchoCheck
git add frontend/app.js
git commit -m "Update backend URL for Render deployment"
git push
```

Render will auto-redeploy the frontend. **Wait a few seconds** and refresh your frontend URL.

---

## Step 6: Test the Live App

1. Open your **frontend URL** in a browser:
   ```
   https://echocheck-frontend.onrender.com
   ```

2. **Sign up** with:
   - **Username:** Any letters and spaces (validation enforced)
   - **Email:** Valid email format (validation enforced)
   - **Password:** At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char

3. **Add a contact:**
   - **Name:** Letters and spaces only
   - **Phone:** Exactly 10 digits (validation enforced)
   - **Email:** Valid format (optional, but validated if provided)

4. **Start a trip**, **check in**, or **trigger SOS** to test core features.

---

## Step 7: Troubleshooting

### Backend not responding

- Check Render dashboard for **Build Logs** and **Runtime Logs**
- Verify `MONGO_URI` is correct (test in MongoDB Atlas)
- Ensure MongoDB allows connections from **0.0.0.0/0** (Network Access)

### Frontend shows errors

- Open **Browser DevTools** (F12) → **Console** to see network errors
- Verify `API_BASE_URL` in `frontend/app.js` matches your backend URL
- Check that backend URL is accessible by visiting:
  ```
  https://echocheck-backend.onrender.com/api/health
  ```
  (Should return `{"status":"ok"}`)

### Validation not working

- Validation is enforced **server-side** (backend) and **client-side** (frontend)
- Invalid inputs will return a `400` error from the API
- Check the error message in the **Network** tab (DevTools) if signup/contact fails

---

## Optional: Custom Domain

If you have a domain (e.g., `myapp.com`):

1. In Render dashboard, go to your service
2. **Settings** → **Custom Domain** → Add your domain
3. Update your DNS records (follow Render's instructions)

---

## Costs & Limits

| Component | Free Tier | Cost |
|-----------|-----------|------|
| Render Web Service (backend) | $0 (auto-sleeps after 15 min inactivity) | $7/month for always-on |
| Render Static Site (frontend) | $0 | $0 |
| MongoDB Atlas | 512MB storage, 3 nodes | Free forever or $57+/month for larger |

**Note:** Free Render services are spun down after 15 minutes of inactivity. First request after sleep takes 30–50 seconds.

---

## Next Steps

- **Monitor logs** in Render dashboard
- **Add a custom domain** if you have one
- **Enable HTTPS** (Render does this automatically)
- **Scale up** when needed (upgrade Instance Type)

---

## Support

- **Render Docs:** https://render.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **EchoCheck Issues:** Check `TROUBLESHOOTING.md` in the repo

---

**Deployed? Share your app URL and start inviting users!**
