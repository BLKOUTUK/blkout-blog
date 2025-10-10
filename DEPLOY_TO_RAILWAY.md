# Deploy BLKOUT Blog to Railway - Quick Guide

## Step 1: Access Railway
1. Go to https://railway.app
2. Sign in with GitHub

## Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose repository: **BLKOUTUK/blkout-blog**

## Step 3: Configure Environment Variables
Add these environment variables in Railway dashboard:

```
SUPABASE_URL=https://lgqknkshpsxtfzqaewfv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWtua3NocHN4dGZ6cWFld2Z2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzQ0NzQzOSwiZXhwIjoyMDQzMDIzNDM5fQ.8LYD0kN7_rG0m9vXQGxhN5mNYP8FZvQ5vhFzXKqYE8I
PORT=3001
```

**How to add variables:**
1. Click on your deployed service
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Add each variable above (name and value)
5. Click **"Add"** for each

## Step 4: Deploy
Railway will automatically:
- Detect `railway.json` configuration
- Install dependencies (`npm install`)
- Start server (`node server.js`)
- Provide you with a live URL

## Step 5: Get Your URL
1. Once deployed, Railway provides a URL like: `https://blkout-blog-production.up.railway.app`
2. Copy this URL
3. Test it by visiting: `https://your-url.railway.app/api/articles`

## Existing Articles
The blog connects to the same Supabase database as the main platform, so all 8 existing articles will automatically appear:

1. "BLKOUTHUB: Where UK Black Queer Men Finally Breathe"
2. "PLATFORM FOR COMMUNITY = LIBERATION: The Forward Archive"
3. "NEWS: Our Stories, Our Power, Our Time"
4. "IVOR: Your Growing Digital Companion"
5. "GOVERNANCE: Real Power, Real People, Real Change"
6. "EVENTS: Where Loneliness Goes to Die"
7. "Come Through! BLKOUTUK's Digital Home Is Open"
8. "The Future of Black Liberation Technology"

## After Deployment
Once you have the Railway URL, we'll add a link to it from the main BLKOUT platform.

---

**Repository**: https://github.com/BLKOUTUK/blkout-blog
**Railway Config**: Uses `railway.json` with health checks
**Database**: Shared Supabase `voices_articles` table
