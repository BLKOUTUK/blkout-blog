const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const twitterService = require('./twitterService');

// Only load .env in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'MISSING');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100) + '-' + Date.now().toString(36);
}

// API Routes

// Get all published articles
app.get('/api/articles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('voices_articles')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve article HTML with OpenGraph meta tags for social sharing (Twitter, LinkedIn, Facebook)
// This route serves an HTML page when crawlers or browsers request /articles/:slug
app.get('/articles/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('voices_articles')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('published', true)
      .single();

    if (error || !data) {
      return res.redirect('/');
    }

    const siteUrl = process.env.SITE_URL || 'https://voices.blkoutuk.cloud';
    const title = data.title || 'BLKOUT Voices';
    const description = (data.excerpt || data.content?.substring(0, 200) || '').replace(/[<>"]/g, '');
    const image = data.hero_image || `${siteUrl}/blkoutlogo-white-transparent.png`;
    const author = data.author || 'BLKOUT UK';
    const url = `${siteUrl}/articles/${data.slug}`;

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | BLKOUT Voices</title>
<meta name="description" content="${description}">
<meta name="author" content="${author}">

<!-- OpenGraph -->
<meta property="og:type" content="article">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="BLKOUT Voices">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@BlkOutUK">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">

<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 0; line-height: 1.8; }
  .header { background: #000; border-bottom: 3px solid #FFD700; padding: 20px; text-align: center; }
  .header img { height: 50px; }
  .header a { color: #FFD700; text-decoration: none; font-size: 14px; }
  .hero-image { width: 100%; max-height: 400px; object-fit: cover; display: block; }
  .container { max-width: 700px; margin: 0 auto; padding: 40px 20px; }
  h1 { font-size: 36px; line-height: 1.2; color: #fff; margin-bottom: 10px; }
  .meta { color: #999; font-size: 14px; margin-bottom: 30px; }
  .content { font-size: 17px; line-height: 1.9; color: #ccc; }
  .content h2 { color: #FFD700; margin-top: 40px; }
  .content a { color: #FFD700; }
  .content strong { color: #fff; }
  .content blockquote, .content .pull-quote { border-left: 3px solid #FFD700; padding-left: 20px; margin: 30px 0; color: #fff; font-size: 19px; }
  .standfirst { font-size: 20px; line-height: 1.6; color: #fff; border-left: 3px solid #FFD700; padding-left: 20px; margin-bottom: 30px; }
  .content em { font-style: italic; color: #aaa; }
  .content ul { padding-left: 20px; }
  .content li { margin-bottom: 8px; }
  .footer { text-align: center; padding: 40px 20px; border-top: 1px solid #222; margin-top: 40px; }
  .footer a { color: #FFD700; text-decoration: none; }
  .footer p { color: #666; font-size: 13px; }
</style>
</head>
<body>
  <div class="header">
    <a href="https://blkoutuk.com"><img src="https://comms.blkoutuk.cloud/images/blkoutlogo_wht_transparent.png" alt="BLKOUT"></a>
    <div style="margin-top:8px;"><a href="${siteUrl}">BLKOUT Voices</a></div>
  </div>
  ${data.hero_image ? `<img class="hero-image" src="${data.hero_image}" alt="${data.hero_image_alt || title}">` : ''}
  <div class="container">
    <h1>${title}</h1>
    <div class="meta">By ${author} · ${data.published_at ? new Date(data.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</div>
    ${data.excerpt ? `<div class="standfirst">${data.excerpt}</div>` : ''}
    <div class="content">${(data.content || '')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/## (.*?)(<br>|<\/p>)/g, '</p><h2>$1</h2><p>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/<br>\* (.*?)(?=<br>|<\/p>)/g, '</p><ul><li>$1</li></ul><p>')
    }</div>
  </div>
  <div class="footer">
    <a href="https://blkoutuk.com">blkoutuk.com</a>
    <p>BLKOUT Creative Ltd · Community Benefit Society RS008088</p>
  </div>
</body>
</html>`);
  } catch (error) {
    console.error('Error serving article HTML:', error);
    res.redirect('/');
  }
});

// Get single article by slug (JSON API)
app.get('/api/articles/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('voices_articles')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('published', true)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin authentication
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'blkout2024';

    if (password === adminPassword) {
      res.json({ success: true, message: 'Authenticated' });
    } else {
      res.status(401).json({ success: false, error: 'Invalid password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new article (admin)
app.post('/api/articles', async (req, res) => {
  // Check admin password
  const adminPassword = process.env.ADMIN_PASSWORD || 'blkout2024';
  const providedPassword = req.headers['x-admin-password'];

  if (providedPassword !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  try {
    const {
      title,
      content,
      excerpt,
      author,
      author_bio,
      category,
      tags = [],
      featured = false,
      published = true,
      hero_image,
      hero_image_alt,
      thumbnail_image,
      thumbnail_alt
    } = req.body;

    // Validate required fields
    if (!title || !content || !author || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, content, author, category'
      });
    }

    const slug = generateSlug(title);
    const articleExcerpt = excerpt || content.substring(0, 200) + '...';

    const articleData = {
      title,
      content,
      excerpt: articleExcerpt,
      author,
      author_bio: author_bio || '',
      category,
      slug,
      published,
      published_at: published ? new Date().toISOString() : null,
      featured,
      tags,
      hero_image,
      hero_image_alt,
      thumbnail_image,
      thumbnail_alt
    };

    const { data, error } = await supabase
      .from('voices_articles')
      .insert([articleData])
      .select();

    if (error) throw error;

    const createdArticle = data[0];

    // Post to Twitter if article is published
    if (published) {
      twitterService.postArticle(createdArticle).catch(err => {
        console.error('Twitter posting failed (non-blocking):', err.message);
      });
    }

    res.json({
      success: true,
      message: 'Article created successfully',
      data: createdArticle
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update article
app.put('/api/articles/:id', async (req, res) => {
  // Check admin password
  const adminPassword = process.env.ADMIN_PASSWORD || 'blkout2024';
  const providedPassword = req.headers['x-admin-password'];

  if (providedPassword !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('voices_articles')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: data[0]
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete article
app.delete('/api/articles/:id', async (req, res) => {
  // Check admin password
  const adminPassword = process.env.ADMIN_PASSWORD || 'blkout2024';
  const providedPassword = req.headers['x-admin-password'];

  if (providedPassword !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('voices_articles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit article pitch (public)
app.post('/api/pitches', async (req, res) => {
  try {
    const {
      title,
      pitch,
      author_name,
      author_email,
      author_bio,
      category
    } = req.body;

    // Validate required fields
    if (!title || !pitch || !author_name || !author_email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, pitch, author_name, author_email'
      });
    }

    const pitchData = {
      title,
      pitch,
      author_name,
      author_email,
      author_bio: author_bio || '',
      category: category || 'opinion',
      status: 'pending',
      submitted_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('voices_pitches')
      .insert([pitchData])
      .select();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Pitch submitted successfully! We\'ll review it and get back to you.',
      data: data[0]
    });
  } catch (error) {
    console.error('Error submitting pitch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all pitches (admin)
app.get('/api/pitches', async (req, res) => {
  // Check admin password
  const adminPassword = process.env.ADMIN_PASSWORD || 'blkout2024';
  const providedPassword = req.headers['x-admin-password'];

  if (providedPassword !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { data, error } = await supabase
      .from('voices_pitches')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching pitches:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update pitch status (admin)
app.put('/api/pitches/:id', async (req, res) => {
  // Check admin password
  const adminPassword = process.env.ADMIN_PASSWORD || 'blkout2024';
  const providedPassword = req.headers['x-admin-password'];

  if (providedPassword !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const { data, error } = await supabase
      .from('voices_pitches')
      .update({ status, admin_notes, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Pitch updated successfully',
      data: data[0]
    });
  } catch (error) {
    console.error('Error updating pitch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// RSS Feed
app.get('/feed', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('voices_articles')
      .select('title, slug, excerpt, content, author, category, published_at, hero_image')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const siteUrl = process.env.SITE_URL || 'https://voices.blkoutuk.cloud';
    const items = (data || []).map(article => {
      const pubDate = new Date(article.published_at).toUTCString();
      const link = `${siteUrl}/article/${article.slug}`;
      const description = article.excerpt || article.content.substring(0, 300) + '...';
      const imageTag = article.hero_image
        ? `<enclosure url="${article.hero_image}" type="image/jpeg" />`
        : '';
      return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${description}]]></description>
      <author>${article.author}</author>
      <category>${article.category}</category>
      <pubDate>${pubDate}</pubDate>
      ${imageTag}
    </item>`;
    }).join('\n');

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/1999/xhtml">
  <channel>
    <title>BLKOUT Voices</title>
    <link>${siteUrl}</link>
    <description>Liberation narratives, views, perspectives and new writing from our community.</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(feed);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    res.status(500).send('Error generating feed');
  }
});

// Alias common feed paths
app.get('/rss', (req, res) => res.redirect(301, '/feed'));
app.get('/rss.xml', (req, res) => res.redirect(301, '/feed'));
app.get('/feed.xml', (req, res) => res.redirect(301, '/feed'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🏴‍☠️ BLKOUT Blog API running on port ${PORT}`);
});
