# ⚡ Quick Start - Free Tier Deployment

Deploy your SecureStack platform in **15 minutes** for **$0/month**.

## 🎯 What You'll Get

- ✅ Fully deployed microservices platform
- ✅ PostgreSQL database
- ✅ Redis caching
- ✅ RabbitMQ messaging
- ✅ Auto-deploy on git push
- ✅ HTTPS enabled
- ✅ Monitoring & logs
- ✅ **Total Cost: $0/month**

## ⏱️ 15-Minute Setup

### Step 1: Create Accounts (5 minutes)

Open these in separate tabs and sign up with GitHub:

1. **Railway.app** → https://railway.app
2. **Neon** → https://neon.tech
3. **Upstash** → https://upstash.com
4. **CloudAMQP** → https://www.cloudamqp.com

### Step 2: Get Credentials (5 minutes)

**From Neon:**
```bash
Dashboard → Connection String → Copy
postgresql://user:pass@ep-xxx.neon.tech/dbname
```

**From Upstash:**
```bash
Dashboard → Redis CLI → Copy URL
redis://:pass@global-xxx.upstash.io:6379
```

**From CloudAMQP:**
```bash
Dashboard → Details → AMQP URL → Copy
amqps://user:pass@coyote.rmq.cloudamqp.com/vhost
```

**From Railway:**
```bash
Account → Tokens → Create Token → Copy
```

### Step 3: Configure GitHub (2 minutes)

In your GitHub repo:

```
Settings → Secrets → Actions → New secret
```

Add these 4 secrets:

| Name | Value |
|------|-------|
| `RAILWAY_TOKEN` | Your Railway token |
| `DATABASE_URL` | Neon PostgreSQL URL |
| `REDIS_URL` | Upstash Redis URL |
| `RABBITMQ_URL` | CloudAMQP URL |

### Step 4: Deploy (3 minutes)

```bash
# Commit and push
git add .
git commit -m "Configure free tier deployment"
git push origin main

# GitHub Actions will automatically:
# 1. Run tests
# 2. Build Docker image
# 3. Deploy to Railway
# 4. Your app is live!
```

**That's it!** ✨

---

## 🔗 Access Your API

After deployment (2-3 minutes), Railway gives you a URL:

```
https://your-app-name.up.railway.app
```

Test it:
```bash
curl https://your-app-name.up.railway.app/health
```

---

## 📊 What's Running

Your free tier includes:

```
┌─────────────────────────────────────┐
│  Railway.app ($5 credit/month)      │
│  └─ Language Detection Service      │
│     └─ Port: 3001                   │
│     └─ Auto HTTPS                   │
│     └─ Auto Deploy on Push          │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Neon PostgreSQL (Free forever)     │
│  └─ 0.5GB storage                   │
│  └─ Serverless                      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Upstash Redis (Free forever)       │
│  └─ 10K commands/day                │
│  └─ Global replication              │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  CloudAMQP RabbitMQ (Free forever)  │
│  └─ 1M messages/month               │
│  └─ 20 connections                  │
└─────────────────────────────────────┘
```

---

## 🧪 Test Your Deployment

### Health Check
```bash
curl https://your-app.up.railway.app/health
```

### Language Detection
```bash
curl -X POST https://your-app.up.railway.app/api/v1/detect \
  -H "Content-Type: application/json" \
  -d '{
    "projectPath": "/path/to/test/project",
    "analyzeDependencies": true,
    "detectFrameworks": true
  }'
```

### Supported Languages
```bash
curl https://your-app.up.railway.app/api/v1/languages
```

---

## 📈 Monitor Your App

### Railway Dashboard
```
https://railway.app → Your Project
```

View:
- Real-time logs
- Metrics (CPU, memory)
- Deployment history
- Environment variables

### GitHub Actions
```
Your Repo → Actions tab
```

View:
- Build status
- Test results
- Deployment logs

---

## 🔄 Continuous Deployment

Every time you push to `main`:

```
1. GitHub Actions runs tests ✅
2. Builds Docker image 🐳
3. Deploys to Railway 🚀
4. App is live in 2-3 minutes ⚡
```

**No manual work needed!**

---

## 📱 Add More Services

Deploy other services the same way:

```bash
# Core Scanner
cd ../core-scanner-service
railway up

# Container Scanner
cd ../container-scanner-service
railway up

# Dependency Scanner
cd ../dependency-scanner-service
railway up
```

Each service gets its own URL and auto-deploys!

---

## 💰 Cost Tracking

### Railway Usage
```
Railway Dashboard → Usage
```

You have **$5 credit/month**. Typical usage:
- 1 service: $2-3/month
- 2 services: $4-5/month
- 3+ services: Upgrade needed

### Tip: Optimize Costs
```bash
# Use smaller instances
# Stop unused services
# Combine services when possible
```

---

## 🆙 Upgrade When Ready

### When you need more:
1. **More Railway credit** → Railway Pro ($20/month)
2. **Bigger database** → Neon Pro ($19/month)
3. **More Redis** → Upstash Pro ($10/month)
4. **Enterprise** → Migrate to AWS

**But start free!** Most projects never need to upgrade.

---

## 🐛 Troubleshooting

### Deployment Failed

```bash
# Check GitHub Actions
Your Repo → Actions → Failed workflow → View logs

# Common fixes:
# 1. Missing secrets → Add in Settings → Secrets
# 2. Build errors → Check npm run build locally
# 3. Docker errors → Test: docker build .
```

### App Won't Start

```bash
# Check Railway logs
railway logs

# Common fixes:
# 1. Missing env vars → Add in Railway dashboard
# 2. Port mismatch → Ensure PORT=3001
# 3. Database error → Check DATABASE_URL
```

### Out of Credits

```bash
# Option 1: Wait for monthly reset
# Option 2: Deploy to Render.com (also free)
# Option 3: Upgrade to Railway Pro
```

---

## 📚 Next Steps

1. ✅ **Test all endpoints** using [test/e2e](./test/e2e)
2. ✅ **Add API authentication** (JWT, API keys)
3. ✅ **Set up monitoring** (Better Stack free tier)
4. ✅ **Add your frontend** (Vercel free tier)
5. ✅ **Invite users** and start testing!

---

## 🎉 You're Live!

Your SecureStack platform is now running in production for **FREE**!

**Endpoints:**
- Health: `GET /health`
- Detect: `POST /api/v1/detect`
- Languages: `GET /api/v1/languages`
- Metrics: `GET /metrics`

**Features:**
- ✅ Auto-deploy on git push
- ✅ Free HTTPS
- ✅ Logs & monitoring
- ✅ Scalable infrastructure
- ✅ Professional setup

**Start building and testing!** 🚀

---

## 📖 More Resources

- [FREE-TIER-SETUP.md](./FREE-TIER-SETUP.md) - Detailed setup guide
- [DEPLOYMENT-OPTIONS.md](./DEPLOYMENT-OPTIONS.md) - Compare all options
- [test/e2e/README.md](./test/e2e/README.md) - E2E testing guide

**Questions?** Create an issue or check Railway/Neon/Upstash docs.
