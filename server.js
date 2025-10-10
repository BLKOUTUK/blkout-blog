const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

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

// Get single article by slug
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

    res.json({
      success: true,
      message: 'Article created successfully',
      data: data[0]
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🏴‍☠️ BLKOUT Blog API running on port ${PORT}`);
});
