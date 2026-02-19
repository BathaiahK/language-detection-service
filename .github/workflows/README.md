# GitHub Actions Workflows

This directory contains CI/CD workflows for the language-detection-service.

## Workflows

### 1. CI - Build & Test ([ci.yml](ci.yml))

**Triggers:** Push to `main`/`develop`, Pull Requests

**What it does:**
- ✅ Lints code with ESLint (warnings don't block)
- ✅ Checks code formatting with Prettier
- ✅ Runs unit tests on Node 18 & 20
- ✅ Builds Docker image
- ✅ Uploads test coverage to Codecov

**Status:** ✅ Active

---

### 2. E2E Tests ([e2e-tests.yml](e2e-tests.yml))

**Triggers:** Push to `main`/`develop`, Pull Requests, Manual

**What it does:**
- ✅ Starts Docker test environment
- ✅ Runs comprehensive E2E tests
- ✅ Generates coverage reports
- ✅ Comments on PRs with test results
- ✅ Shows service logs on failure

**Status:** ✅ Active

---

### 3. Deploy to Railway ([deploy-railway.yml](deploy-railway.yml))

**Triggers:** Manual only (workflow_dispatch)

**What it does:**
- ✅ Runs tests
- ✅ Deploys to Railway.app (if RAILWAY_TOKEN is set)
- ✅ Provides deployment URL

**Status:** ⏸️ Disabled (run manually when Railway is configured)

**To enable:**
1. Create Railway account at https://railway.app
2. Get Railway API token from dashboard
3. Add `RAILWAY_TOKEN` to GitHub secrets
4. Manually trigger workflow from Actions tab

---

### 4. Deploy to Render ([deploy-render.yml](deploy-render.yml))

**Triggers:** Manual only (workflow_dispatch)

**What it does:**
- ✅ Triggers deployment on Render.com
- ✅ Alternative to Railway

**Status:** ⏸️ Disabled (run manually when Render is configured)

**To enable:**
1. Create Render account at https://render.com
2. Get Render API key
3. Add `RENDER_API_KEY` and `RENDER_SERVICE_ID` to GitHub secrets
4. Manually trigger workflow from Actions tab

---

## Required Secrets

For deployment workflows to work, add these secrets in:
`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### Optional (for deployment)

| Secret Name | Required For | Where to Get |
|-------------|--------------|--------------|
| `RAILWAY_TOKEN` | Railway deployment | Railway Dashboard → Account → Tokens |
| `RENDER_API_KEY` | Render deployment | Render Dashboard → Account Settings → API Keys |
| `RENDER_SERVICE_ID` | Render deployment | Render Service → Settings |
| `DATABASE_URL` | Production config | Neon.tech dashboard |
| `REDIS_URL` | Production config | Upstash.com dashboard |
| `RABBITMQ_URL` | Production config | CloudAMQP.com dashboard |

---

## Workflow Status

| Workflow | Status | Runs On | Blocking |
|----------|--------|---------|----------|
| CI | ✅ Active | Every push | Yes |
| E2E Tests | ✅ Active | Every push | Yes |
| Deploy Railway | ⏸️ Manual | Manual only | No |
| Deploy Render | ⏸️ Manual | Manual only | No |

---

## How to Use

### For Development

Just push your code! CI and E2E tests run automatically:

```bash
git add .
git commit -m "Add feature"
git push origin main
```

GitHub Actions will:
1. ✅ Lint and format check
2. ✅ Run unit tests
3. ✅ Run E2E tests
4. ✅ Build Docker image

### For Deployment

**Option 1: Railway (Recommended for free tier)**

1. Set up Railway account and get token
2. Add `RAILWAY_TOKEN` to GitHub secrets
3. Go to Actions → Deploy to Railway → Run workflow
4. Your app is live!

**Option 2: Render**

1. Set up Render account and get API key
2. Add secrets to GitHub
3. Go to Actions → Deploy to Render → Run workflow

**Option 3: Manual deployment**

Follow the [FREE-TIER-SETUP.md](../../FREE-TIER-SETUP.md) guide.

---

## Troubleshooting

### CI Fails

```bash
# Check logs in GitHub Actions tab
# Common issues:
# 1. Linting errors → Run: npm run lint:fix
# 2. Test failures → Run: npm test
# 3. Build errors → Run: npm run build
```

### E2E Tests Fail

```bash
# E2E tests require Docker
# In CI, Docker is available automatically
# Locally, ensure Docker is running:
docker info
```

### Deployment Fails

```bash
# Check that secrets are set:
Settings → Secrets → Actions

# Check logs in Actions tab
# Ensure Railway/Render is properly configured
```

---

## Adding New Workflows

1. Create new `.yml` file in this directory
2. Follow existing patterns
3. Test with `workflow_dispatch` trigger first
4. Document in this README

---

## Best Practices

- ✅ Use `workflow_dispatch` for deployment workflows
- ✅ Make deployments opt-in with secret checks
- ✅ Use `continue-on-error: true` for non-blocking checks
- ✅ Always run tests before deployment
- ✅ Document required secrets
- ✅ Keep workflows simple and focused

---

## Learn More

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway Deployment Guide](../../QUICK-START-FREE-TIER.md)
- [E2E Testing Guide](../../test/e2e/README.md)
