# BLKOUT Blog - Railway Deployment Guide

## Quick Start (Web Interface - RECOMMENDED)

Railway CLI requires interactive terminal which won't work in non-interactive environments. Use the web interface instead.

### 1. Access Railway Dashboard
Go to: https://railway.app/dashboard

### 2. Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose: **BLKOUTUK/blkout-blog**
4. Railway will automatically detect the configuration from `railway.json`

### 3. Add Environment Variables

Click on your service → **Variables** tab → Add these variables:

```bash
SUPABASE_URL=https://lgqknkshpsxtfzqaewfv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWtua3NocHN4dGZ6cWFld2Z2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzQ0NzQzOSwiZXhwIjoyMDQzMDIzNDM5fQ.8LYD0kN7_rG0m9vXQGxhN5mNYP8FZvQ5vhFzXKqYE8I
ADMIN_PASSWORD=blkout2024
PORT=3001
```

**Note**: The `ADMIN_PASSWORD` protects article creation, editing, and deletion. Change this to a strong password in production.

### 4. Deploy
Railway will:
- ✅ Auto-detect Node.js project
- ✅ Run `npm install`
- ✅ Execute `node server.js` (from railway.json)
- ✅ Set up health checks at `/api/health`
- ✅ Provide a production URL

### 5. Get Your URL
Once deployed, Railway provides a URL like:
```
https://blkout-blog-production.up.railway.app
```

### 6. Test the Deployment
Visit these endpoints to verify:

**API Endpoint:**
```
https://your-url.railway.app/api/articles
```

**Frontend:**
```
https://your-url.railway.app
```

## What's Already Configured

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Existing Articles
The blog connects to the same Supabase database, so all 8 articles are already available:

1. ✅ "BLKOUTHUB: Where UK Black Queer Men Finally Breathe"
2. ✅ "PLATFORM FOR COMMUNITY = LIBERATION: The Forward Archive"
3. ✅ "NEWS: Our Stories, Our Power, Our Time"
4. ✅ "IVOR: Your Growing Digital Companion"
5. ✅ "GOVERNANCE: Real Power, Real People, Real Change"
6. ✅ "EVENTS: Where Loneliness Goes to Die"
7. ✅ "Come Through! BLKOUTUK's Digital Home Is Open"
8. ✅ "The Future of Black Liberation Technology"

## Next Steps After Deployment

1. Copy the production URL from Railway
2. Add link to main BLKOUT platform navigation
3. Test article display and submission

---

**Repository:** https://github.com/BLKOUTUK/blkout-blog
**Logged in as:** rob@blkoutuk.com
**Railway Account:** blkoutuk's Projects
