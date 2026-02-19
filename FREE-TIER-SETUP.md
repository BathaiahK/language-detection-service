# 🆓 Free Tier Deployment Guide

Complete guide to deploy SecureStack platform using 100% free tier services.

## 📋 Prerequisites

- GitHub account (free)
- Git installed locally

## 🎯 Total Monthly Cost: $0

---

## Step 1: Create Free Service Accounts (5 minutes)

### 1.1 Railway.app (Hosting - Free $5/month credit)

```bash
# Go to: https://railway.app
# Click "Login with GitHub"
# Authorize Railway
# You get $5 free credit per month (enough for 2-3 small services)
```

**What you get:**
- $5 credit/month (renews monthly)
- ~500MB RAM per service
- 1GB storage
- Custom domains (free)
- Automatic HTTPS

### 1.2 Neon (PostgreSQL Database - Free)

```bash
# Go to: https://neon.tech
# Sign up with GitHub
# Create a new project
```

**What you get:**
- 0.5GB storage (free forever)
- Serverless PostgreSQL
- Auto-scaling
- Branching (like git for databases)

**After signup, copy your connection string:**
```
postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb
```

### 1.3 Upstash (Redis - Free)

```bash
# Go to: https://upstash.com
# Sign up with GitHub
# Create a database (select "Global" for free tier)
```

**What you get:**
- 10,000 commands/day (free forever)
- Global replication
- REST API

**After setup, copy your Redis URL:**
```
redis://:password@global-animal-12345.upstash.io:6379
```

### 1.4 CloudAMQP (RabbitMQ - Free)

```bash
# Go to: https://www.cloudamqp.com
# Sign up (free)
# Create instance: Plan "Little Lemur" (FREE)
# Region: Choose closest to you
```

**What you get:**
- 1 million messages/month (free forever)
- 20 connections
- 10 queues

**After setup, copy your AMQP URL:**
```
amqps://user:pass@coyote.rmq.cloudamqp.com/vhost
```

---

## Step 2: Configure GitHub Repository (2 minutes)

### 2.1 Add Repository Secrets

Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Add these secrets:

| Secret Name | Value | Where to get it |
|-------------|-------|-----------------|
| `RAILWAY_TOKEN` | Railway API token | Railway Dashboard → Account → Tokens |
| `DATABASE_URL` | Neon connection string | Neon Dashboard → Connection Details |
| `REDIS_URL` | Upstash Redis URL | Upstash Dashboard → REST API |
| `RABBITMQ_URL` | CloudAMQP URL | CloudAMQP Dashboard → Details |

### 2.2 Get Railway Token

```bash
# Method 1: Via Railway Dashboard
1. Go to: https://railway.app/account/tokens
2. Click "Create Token"
3. Name it: "GitHub Actions"
4. Copy the token

# Method 2: Via Railway CLI
npm install -g @railway/cli
railway login
railway tokens create
```

---

## Step 3: Deploy to Railway (2 minutes)

### Option A: Deploy via GitHub (Recommended)

```bash
# 1. Push your code to GitHub
git add .
git commit -m "Add free tier deployment"
git push origin main

# 2. GitHub Actions will automatically deploy!
# Check: Actions tab in your repo
```

### Option B: Deploy via Railway Dashboard

```bash
# 1. Go to Railway Dashboard
# 2. Click "New Project"
# 3. Select "Deploy from GitHub repo"
# 4. Choose your repository
# 5. Railway auto-detects Dockerfile and deploys
```

### Option C: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

---

## Step 4: Configure Environment Variables in Railway (1 minute)

In Railway Dashboard for your service:

```bash
# Go to: Railway Project → Service → Variables

# Add these:
NODE_ENV=production
PORT=3001
DATABASE_URL=${DATABASE_URL}  # From Neon
REDIS_URL=${REDIS_URL}        # From Upstash
RABBITMQ_URL=${RABBITMQ_URL}  # From CloudAMQP
RABBITMQ_ENABLED=true
LOG_LEVEL=info
ENABLE_METRICS=true
```

---

## Step 5: Get Your API URL (Instant)

After deployment, Railway gives you a URL:

```
https://your-app.up.railway.app
```

Test it:
```bash
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "@securestack/language-detection-service",
  "version": "1.0.0",
  "uptime": 123.45
}
```

---

## 🧪 Testing Your Deployment

### Test Language Detection

```bash
# Create a test project locally
mkdir test-project
cd test-project
echo '{"name": "test"}' > package.json
echo 'console.log("hello")' > index.js

# Upload and test (you'll need to implement file upload or use local paths)
curl -X POST https://your-app.up.railway.app/api/v1/detect \
  -H "Content-Type: application/json" \
  -d '{"projectPath": "/tmp/test-project"}'
```

### Monitor Logs

```bash
# Via Railway CLI
railway logs

# Via Dashboard
# Railway Dashboard → Service → Deployments → View Logs
```

---

## 📊 Free Tier Limits

| Service | Free Tier | Your Usage (estimated) | Headroom |
|---------|-----------|------------------------|----------|
| **Railway** | $5 credit/month | $3-4/month | ✅ Good |
| **GitHub Actions** | 2,000 min/month | ~100-200 min/month | ✅ Plenty |
| **Neon DB** | 0.5GB storage | ~50MB | ✅ Lots of space |
| **Upstash Redis** | 10K commands/day | ~100-500/day | ✅ More than enough |
| **CloudAMQP** | 1M messages/month | ~1,000-10,000/month | ✅ Plenty |

**Conclusion:** You can run this for **FREE** indefinitely while testing!

---

## 🚀 Deployment Workflow

Every time you push to `main`:

```
1. GitHub Actions triggers
2. Runs tests (uses free GitHub minutes)
3. Builds Docker image
4. Deploys to Railway
5. Railway deploys with zero downtime
6. New version is live!
```

Total time: **2-3 minutes** ⚡

---

## 📈 Scaling Path (When You Get Users)

| Users | Solution | Cost |
|-------|----------|------|
| **1-10 (You)** | Railway Free Tier | $0 |
| **10-100** | Railway Pro ($5-20/mo) | $5-20 |
| **100-1,000** | Railway + bigger DB | $20-50 |
| **1,000+** | AWS ECS + RDS | $100-200 |
| **10,000+** | Kubernetes (EKS/GKE) | $300-500 |

**Start free, scale when you need it!**

---

## 🔧 Alternative Free Options

If Railway credits run out, try these **100% free alternatives**:

### Render.com (Free Tier)
- 750 hours/month (enough for 1 service 24/7)
- Auto-deploy from GitHub
- Free SSL
- No credit card required

```bash
# Deploy to Render:
1. Go to: https://render.com
2. New Web Service → Connect GitHub
3. Select repo
4. Render auto-detects and deploys
```

### Fly.io (Free Tier)
- 3 shared VMs (256MB RAM each)
- 160GB bandwidth/month
- Global deployment

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy
```

### Google Cloud Run (Free Tier)
- 2 million requests/month
- 180,000 vCPU-seconds/month
- 360,000 GiB-seconds/month

---

## ✅ Verification Checklist

- [ ] Railway account created
- [ ] Neon PostgreSQL database created
- [ ] Upstash Redis created
- [ ] CloudAMQP RabbitMQ created
- [ ] GitHub secrets configured
- [ ] Code pushed to GitHub
- [ ] GitHub Actions workflow ran successfully
- [ ] Service deployed on Railway
- [ ] Health check endpoint returns 200
- [ ] Environment variables configured

---

## 🆘 Troubleshooting

### Railway deployment fails

```bash
# Check logs
railway logs

# Common issues:
# 1. Missing environment variables → Add in Railway dashboard
# 2. Port mismatch → Ensure PORT=3001 in .env
# 3. Build fails → Check Dockerfile syntax
```

### Database connection fails

```bash
# Test Neon connection
psql "postgresql://user:pass@ep-xxx.neon.tech/dbname"

# Common issues:
# 1. Wrong connection string → Re-copy from Neon
# 2. SSL required → Add ?sslmode=require to URL
```

### Out of Railway credits

```bash
# Check usage
railway status

# Solutions:
# 1. Wait for monthly reset (1st of month)
# 2. Switch to Render.com (free tier)
# 3. Optimize resource usage
```

---

## 🎉 You're Done!

Your SecureStack platform is now running **100% FREE** in production!

**Next steps:**
1. Test all endpoints
2. Run E2E tests against production
3. Monitor logs and metrics
4. Build features
5. Get users
6. Scale when needed

**Questions?** Check Railway/Neon/Upstash documentation or create a GitHub issue.
