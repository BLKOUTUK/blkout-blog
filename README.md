# BLKOUT Blog - Standalone Blog Application

A completely separate blog application with its own backend that works.

## Features

- ✅ Node.js/Express backend
- ✅ Full CRUD API for articles
- ✅ Matches BLKOUT platform design
- ✅ Simple admin interface
- ✅ Connects to existing Supabase database

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your Supabase credentials to `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

4. Start the server:
```bash
node server.js
```

5. Open browser to `http://localhost:3001`

## API Endpoints

- `GET /api/articles` - Get all published articles
- `GET /api/articles/:slug` - Get single article
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

## Deployment

### Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Add environment variables in Railway dashboard

### Render

1. Create new Web Service
2. Connect this repository
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables

### Heroku

1. Create new app:
```bash
heroku create blkout-blog
```

2. Add environment variables:
```bash
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_key
```

3. Deploy:
```bash
git push heroku main
```
