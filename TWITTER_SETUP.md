# Twitter Auto-Posting Setup for Voices

## ✅ What's Been Done

1. ✅ Created `twitterService.js` - handles Twitter API posting
2. ✅ Integrated into `server.js` - auto-posts when articles are published
3. ✅ Pushed to GitHub - changes are live in repository
4. ✅ Added axios dependency - installed and ready

## 🚀 Deploy to Railway

### Step 1: Twitter API Credentials

You already have your Twitter OAuth 1.0a API credentials:
- API Key (Consumer Key)
- API Secret (Consumer Secret)
- Access Token
- Access Token Secret

These credentials are used to authenticate with Twitter API v2.

### Step 2: Add Environment Variables to Railway

1. Go to Railway dashboard: [https://railway.app](https://railway.app)
2. Find your **blkout-blog** project
3. Click on the service
4. Go to **Variables** tab
5. Add these new variables:

```
TWITTER_ENABLED=true
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
WEBSITE_URL=https://blkoutuk.com
```

**Important:** Keep your existing variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.)

### Step 3: Deploy

Railway will automatically redeploy when you add the environment variables. The latest code from GitHub (with Twitter integration) will be deployed.

## 🎯 How It Works

When you publish a Voices article:

1. Article is created in Supabase
2. **Automatically** posts to Twitter with:
   - Article title (truncated if needed for 280 char limit)
   - Link to article (https://blkoutuk.com/voices/{slug})
   - Smart hashtags (#BLKOUT #BlackQueer + category-specific)

**Example Tweet:**
```
BLKOUT Photo Competition Winners Announced

https://blkoutuk.com/voices/photo-competition-winners

#BLKOUT #BlackQueer #Community
```

## 📱 Hashtag Strategy

**Always Included:**
- #BLKOUT
- #BlackQueer

**Category-Specific:**
- opinion → #Opinion
- community → #Community
- culture → #BlackCulture
- politics → #LGBTQ
- health → #MentalHealth
- arts → #BlackArt
- lived-experience → #LivedExperience

## 🧪 Test It

### After Deployment:

1. Go to your admin panel
2. Create a test article with `published: true`
3. Check Twitter - should auto-post immediately!

### If It Doesn't Work:

Check Railway logs:
```bash
railway logs
```

Look for:
- `📱 Posting to Twitter/X: {article title}`
- `✅ Posted to Twitter: {tweet url}`
- Or error messages with ❌

## 🔧 Configuration

**Enable/Disable Twitter Posting:**
```
TWITTER_ENABLED=true   # Posts to Twitter
TWITTER_ENABLED=false  # Disables Twitter posting
```

**Non-Blocking:**
- If Twitter posting fails, the article still gets created successfully
- Errors are logged but don't stop article publication

## 🛡️ Security

- Never commit `.env` file
- Twitter OAuth credentials are sensitive - keep them secure
- Rotate tokens regularly if compromised
- Use different credentials for dev/production environments

## 📊 Monitoring

Watch Railway logs for:
- Successful posts: `✅ Posted to Twitter`
- Failures: `❌ Twitter posting failed`
- Configuration issues: `Twitter API credentials not configured`
- Authentication method: `Using OAuth 1.0a authentication`

## 🎉 That's It!

Once you add the Twitter credentials to Railway, every published Voices article will automatically post to Twitter. No manual posting needed!

---

**Built for Black Queer Liberation** 🏳️‍🌈
