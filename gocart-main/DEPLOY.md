# ╔══════════════════════════════════════════════════════════════╗
# ║              ShopPilot AI — Deployment Guide                ║
# ╚══════════════════════════════════════════════════════════════╝

## Architecture

```
                    ┌─────────────────┐
                    │   Vercel CDN    │  ← Frontend (Next.js)
                    │  your-app.vercel│
                    └────────┬────────┘
                             │ API calls
                    ┌────────▼────────┐
                    │   Railway/Render │  ← Backend (Express)
                    │  :5000/api/*    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌──────▼──────┐  ┌───▼────────┐
     │ MongoDB    │  │   Groq API  │  │ Cloudinary │
     │ Atlas      │  │  (AI/LLM)   │  │ (Images)   │
     └────────────┘  └─────────────┘  └────────────┘
```

## Step-by-Step Deployment

### 1. MongoDB Atlas (Database)

```bash
# 1. Go to https://cloud.mongodb.com
# 2. Click "Create a free M0 cluster"
# 3. Choose region closest to your users
# 4. Database Access → "Add New Database User"
#    - Username: shoppilot
#    - Password: (generate a strong password)
#    - Role: readWrite on "shoppilot-ai" database
# 5. Network Access → "Add IP Address"
#    - Add: 0.0.0.0/0 (allow all — for cloud deployments)
# 6. Deployment → "Connect" → "Connect your application"
# 7. Copy the connection string:
#    mongodb+srv://shoppilot:<password>@cluster0.xxxxx.mongodb.net/shoppilot-ai?retryWrites=true&w=majority
```

### 2. Groq (AI — Free Tier)

```bash
# 1. Go to https://console.groq.com
# 2. Sign up (free — 30 RPM, 14,400 RPD)
# 3. API Keys → "Create API Key"
# 4. Copy: gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# 5. No credit card needed
```

### 3. Cloudinary (Image Storage — Free Tier)

```bash
# 1. Go to https://cloudinary.com
# 2. Sign up for free (25GB storage, 25GB bandwidth/month)
# 3. Dashboard → Copy:
#    - Cloud Name: your-cloud-name
#    - API Key: 123456789012345
#    - API Secret: abc123def456
```

### 4. Backend Deployment (Railway)

```bash
# Option A: Railway (Recommended — free $5/month credit)

# 1. Go to https://railway.app
# 2. Sign in with GitHub
# 3. "New Project" → "Deploy from GitHub repo"
# 4. Select your ShopPilot-AI repo
# 5. Settings:
#    - Root Directory: server
#    - Build Command: npm install
#    - Start Command: node server.js
# 6. Variables tab → Add:
#    NODE_ENV=production
#    PORT=5000
#    MONGODB_URI=mongodb+srv://...
#    JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
#    JWT_EXPIRES_IN=7d
#    GROQ_API_KEY=gsk_...
#    CORS_ORIGIN=https://your-app.vercel.app
# 7. Deploy → Wait for "Deployment successful"
# 8. Settings → Networking → "Generate Domain"
#    → Copy: shoppilot-ai-backend.up.railway.app

# Option B: Render (Alternative — free tier with 750 hrs/month)

# 1. Go to https://render.com
# 2. "New" → "Web Service"
# 3. Connect GitHub repo
# 4. Settings:
#    - Root Directory: server
#    - Runtime: Node
#    - Build Command: npm install
#    - Start Command: node server.js
# 5. Environment tab → Add same variables as Railway
# 6. Create Service → Wait for deployment
```

### 5. Frontend Deployment (Vercel)

```bash
# 1. Go to https://vercel.com
# 2. "Add New Project" → Import GitHub repo
# 3. Framework: Next.js (auto-detected)
# 4. Root Directory: . (leave empty)
# 5. Environment Variables → Add:
#    NEXT_PUBLIC_API_URL=https://shoppilot-ai-backend.up.railway.app
#    NEXT_PUBLIC_SOCKET_URL=https://shoppilot-ai-backend.up.railway.app
# 6. Deploy
# 7. Once deployed, copy your URL:
#    https://shoppilot-ai.vercel.app
```

### 6. Final Configuration

```bash
# Update CORS_ORIGIN on backend to match your Vercel URL:
# In Railway → Variables → CORS_ORIGIN = https://shoppilot-ai.vercel.app

# Update vercel.json rewrites to match your backend URL:
# "source": "/api/:path*"
# "destination": "https://shoppilot-ai-backend.up.railway.app/api/:path*"
```

## Environment Variables Checklist

| Variable | Where to Set | Value |
|---|---|---|
| `MONGODB_URI` | Railway/Render | `mongodb+srv://...` |
| `JWT_SECRET` | Railway/Render | 64-char random string |
| `GROQ_API_KEY` | Railway/Render | `gsk_...` |
| `CLOUDINARY_CLOUD_NAME` | Railway/Render | from dashboard |
| `CLOUDINARY_API_KEY` | Railway/Render | from dashboard |
| `CLOUDINARY_API_SECRET` | Railway/Render | from dashboard |
| `CORS_ORIGIN` | Railway/Render | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Vercel | `https://your-backend.railway.app` |
| `NEXT_PUBLIC_SOCKET_URL` | Vercel | `https://your-backend.railway.app` |

## Cost Breakdown (Free Tier)

| Service | Free Tier | What You Get |
|---|---|---|
| **Vercel** | 100GB bandwidth | Next.js hosting, CDN, SSL |
| **Railway** | $5/month credit | Backend hosting, Docker |
| **MongoDB Atlas** | 512MB storage | M0 cluster, 100 connections |
| **Groq** | Free | 30 RPM, 14,400 RPD |
| **Cloudinary** | 25GB storage | Image hosting, transforms |
| **Total** | **~$0/month** | Full-stack AI e-commerce |

## Post-Deployment Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Backend health check: `GET https://your-backend.railway.app/api/health`
- [ ] Frontend loads: `GET https://your-app.vercel.app`
- [ ] Can register/login
- [ ] Products load
- [ ] AI features work (Shopping Assistant, Product Generator, etc.)
- [ ] Image upload works
- [ ] Socket.IO connects (real-time features)
- [ ] SSL certificates valid (HTTPS)
- [ ] Error handling works (try invalid routes)

## Troubleshooting

### CORS Error
```
Access-Control-Allow-Origin header is missing
```
**Fix:** Set `CORS_ORIGIN` on Railway to your exact Vercel URL (no trailing slash)

### MongoDB Connection Refused
```
MongooseServerSelectionError: connect ECONNREFUSED
```
**Fix:** Check Network Access on MongoDB Atlas (add 0.0.0.0/0) and MONGODB_URI format

### Socket.IO Not Connecting
```
WebSocket connection failed
```
**Fix:** Ensure `NEXT_PUBLIC_SOCKET_URL` matches backend URL. Socket.IO needs wss:// for production.

### Groq Rate Limit
```
429 Too Many Requests
```
**Fix:** Free tier = 30 requests/minute. Implement client-side retry with backoff.

## Going Further

### Custom Domain
```bash
# Vercel: Project Settings → Domains → Add your domain
# Railway: Settings → Networking → Custom Domain
```

### Monitoring
```bash
# Railway: Built-in metrics dashboard
# Render: Logs tab for real-time logs
# Vercel: Analytics tab for frontend performance
```

### Scaling
```bash
# Railway: Upgrade to $20/month for 8GB RAM, no sleeping
# MongoDB Atlas: Upgrade to M10 for dedicated cluster
# Vercel: Pro plan for team features
```
