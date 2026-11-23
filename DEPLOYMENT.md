# Deploying SSF PUTHUR SECTOR Application to Render with Git

This complete MERN stack application (MongoDB, Express, React, Node.js) can be deployed to **[Render.com](https://render.com)** using Git in two ways:
- **Method 1 (Recommended): Separate Web Service (Backend) + Static Site (Frontend)**
- **Method 2 (Single Service): All-In-One Unified Web Service** (Uses only 1 free service slot on Render!)
- **Method 3: 1-Click Render Blueprint (`render.yaml`)**

---

## Step 1: Push Your Code to GitHub / GitLab

If you haven't initialized Git yet, open your terminal in the project root:

```bash
# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: SSF Puthur Sector MERN Application"

# 4. Create a repository on GitHub (e.g. ssf-puthur-sector)
# Then link and push:
git remote add origin https://github.com/<YOUR-USERNAME>/ssf-puthur-sector.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up Free Cloud MongoDB Atlas

Render requires a cloud MongoDB database:
1. Go to **[mongodb.com/atlas](https://www.mongodb.com/atlas)** and sign in (Free).
2. Create a Free **M0 Shared Cluster**.
3. Under **Security → Database Access**, create a user (e.g., `ssfadmin` with a password).
4. Under **Security → Network Access**, add IP Address `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect → Drivers (Node.js)** and copy your connection string:
   ```text
   mongodb+srv://ssfadmin:<password>@cluster0.xxxxx.mongodb.net/ssf_puthur_sector?retryWrites=true&w=majority
   ```

---

## Method 1: Separate Backend + Frontend (Recommended)

### A. Deploy Backend API (Web Service)
1. Go to your **Render Dashboard** (`dashboard.render.com`) → Click **New +** → **Web Service**.
2. Select your GitHub repository (`ssf-puthur-sector`).
3. Fill in the service configuration:
   - **Name:** `ssf-puthur-server`
   - **Region:** Any (e.g., Frankfurt or Singapore)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | `mongodb+srv://...` (your Atlas URI from Step 2) |
   | `JWT_SECRET` | `your_super_secret_jwt_key_2026` |
   | `ADMIN_PIN` | `7860` (or your chosen 4-digit PIN) |
5. Click **Deploy Web Service**.
6. Once deployed, copy your backend URL, e.g.:
   ```text
   https://ssf-puthur-server.onrender.com
   ```

---

### B. Deploy Frontend (Static Site)
1. In Render Dashboard, click **New +** → **Static Site**.
2. Select the same GitHub repository (`ssf-puthur-sector`).
3. Fill in the settings:
   - **Name:** `ssf-puthur-portal`
   - **Branch:** `main`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://ssf-puthur-server.onrender.com/api` |
5. **CRITICAL STEP FOR REACT ROUTER (`/admin` SPA):**
   - Scroll down to **Redirects / Rewrites**.
   - Click **Add Rule**:
     - **Source:** `/*`
     - **Destination:** `/index.html`
     - **Action:** `Rewrite`
   *(This ensures that refreshing `/admin` does not return a 404 error)*.
6. Click **Create Static Site**.
7. Your app is now live at:
   ```text
   https://ssf-puthur-portal.onrender.com
   ```

---

## Method 2: Single All-in-One Service (Saves Render Free Slots)

This project is pre-configured with unified static serving in `server/server.js` and a root `package.json`!

1. Go to **Render Dashboard** → **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure:
   - **Name:** `ssf-puthur-fullstack`
   - **Root Directory:** *(leave blank / project root)*
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Add Environment Variables:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | `mongodb+srv://...` (your MongoDB Atlas URI) |
   | `JWT_SECRET` | `your_secret_key` |
   | `ADMIN_PIN` | `7860` |
5. Click **Deploy Web Service**.
6. Both Frontend and Backend will be hosted under one single URL!

---

## Method 3: 1-Click Render Blueprint (`render.yaml`)

We have already created the `render.yaml` blueprint file in the repository root.

1. Go to **Render Dashboard** → **New +** → **Blueprint**.
2. Connect your repository.
3. Render reads `render.yaml` and sets up both the `server` and `client` services automatically!
4. Fill in `MONGODB_URI` when prompted, and click **Apply**.

---

## Verifying Deployment

1. **Public Registration**: Visit `https://your-app.onrender.com/`
   - Verify that there is **NO** admin button or clue visible.
   - Test candidate registration (Name, Phone, Unit dropdown).
   - Verify unique ticket generation and QR code render.
   - Test "Download Ticket (PNG)" and "Share to WhatsApp".
2. **Admin Portal**: Visit `https://your-app.onrender.com/admin`
   - Unlock with your PIN (default `7860`).
   - Click **"Copy Admin Link"** to test clipboard copy.
   - Test **7 Units Management** (add/edit/delete units).
   - Test **QR Scanner & Check-In** (camera scan or manual ticket input).
   - Test **Unit-Wise WhatsApp Report** and **Full Sector Report**.
   - Test **Logo and Poster Uploads**.
