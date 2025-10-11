// Enhanced BLKOUT Extension with RAG System Integration
const API_BASE = 'https://blkout-beta.vercel.app/api';

class BlkoutRAGPopup {
  constructor() {
    this.currentTab = null;
    this.suggestedContent = null;
    this.ragEnabled = true;
    this.init();
  }
  
  async init() {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize RAG-enhanced features
    await this.initializeRAGFeatures();
  }
  
  setupEventListeners() {
    // Enhanced quick action buttons
    document.getElementById('submit-event').addEventListener('click', () => {
      this.showEnhancedForm('event');
    });
    
    document.getElementById('submit-article').addEventListener('click', () => {
      this.showEnhancedForm('article');
    });
    
    document.getElementById('smart-suggest').addEventListener('click', () => {
      this.performSmartSuggestion();
    });
    
    document.getElementById('bulk-import').addEventListener('click', () => {
      this.showBulkImportDialog();
    });
    
    // Form submission with RAG enhancement
    document.getElementById('submission-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEnhancedSubmit();
    });
    
    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
      this.hideForm();
    });
    
    // RAG toggle
    document.getElementById('rag-toggle').addEventListener('change', (e) => {
      this.ragEnabled = e.target.checked;
      this.updateUIForRAGStatus();
    });
  }
  
  async initializeRAGFeatures() {
    try {
      // Check RAG system status
      const response = await fetch(`${API_BASE}/rag/ingest`);
      const status = await response.json();
      
      if (status.success) {
        this.showRAGStatus('operational');
        await this.performSmartContentDetection();
      } else {
        this.showRAGStatus('unavailable');
        this.ragEnabled = false;
      }
    } catch (error) {
      console.error('RAG system unavailable:', error);
      this.showRAGStatus('error');
      this.ragEnabled = false;
    }
  }
  
  async performSmartContentDetection() {
    if (!this.ragEnabled) return;
    
    try {
      // Extract content from current page
      const pageContent = await this.extractPageContent();
      
      if (pageContent) {
        // Check if this content already exists or is similar to existing content
        const similarContent = await this.findSimilarContent(pageContent.title + ' ' + pageContent.description);
        
        if (similarContent.length > 0) {
          this.showDuplicateWarning(similarContent);
        } else {
          // Get AI-powered content suggestions
          const suggestions = await this.getContentSuggestions(pageContent);
          this.showContentSuggestions(suggestions);
        }
      }
    } catch (error) {
      console.error('Smart content detection failed:', error);
    }
  }
  
  async extractPageContent() {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        function: this.extractContentFromPage
      });
      
      return results[0]?.result || null;
    } catch (error) {
      console.error('Content extraction failed:', error);
      return null;
    }
  }
  
  // Function that runs in the page context
  extractContentFromPage() {
    // Enhanced content extraction with multiple strategies
    
    // Strategy 1: Structured data (JSON-LD, microdata)
    const structuredData = extractStructuredData();
    if (structuredData) return structuredData;
    
    // Strategy 2: Open Graph / Twitter Cards
    const socialMeta = extractSocialMeta();
    if (socialMeta) return socialMeta;
    
    // Strategy 3: Article/event-specific selectors
    const specificContent = extractSpecificContent();
    if (specificContent) return specificContent;
    
    // Strategy 4: General content extraction
    return extractGeneralContent();
    
    function extractStructuredData() {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent);
          if (data['@type'] === 'Event' || data['@type'] === 'Article') {
            return {
              title: data.name || data.headline,
              description: data.description,
              content: data.description || data.articleBody,
              author: data.author?.name || data.organizer?.name,
              publishedAt: data.datePublished || data.startDate,
              imageUrl: data.image?.url || data.image,
              type: data['@type'].toLowerCase(),
              location: data.location?.name,
              url: window.location.href,
              confidence: 0.9
            };
          }
        } catch (e) {
          continue;
        }
      }
      return null;
    }
    
    function extractSocialMeta() {
      const title = document.querySelector('meta[property="og:title"]')?.content ||
                   document.querySelector('meta[name="twitter:title"]')?.content;
      const description = document.querySelector('meta[property="og:description"]')?.content ||
                         document.querySelector('meta[name="twitter:description"]')?.content ||
                         document.querySelector('meta[name="description"]')?.content;
      const image = document.querySelector('meta[property="og:image"]')?.content ||
                   document.querySelector('meta[name="twitter:image"]')?.content;
      
      if (title && description) {
        return {
          title,
          description,
          content: description,
          imageUrl: image,
          url: window.location.href,
          confidence: 0.7
        };
      }
      return null;
    }
    
    function extractSpecificContent() {
      // Eventbrite events
      if (window.location.hostname.includes('eventbrite')) {
        return extractEventbriteEvent();
      }
      
      // News articles
      if (isNewsWebsite()) {
        return extractNewsArticle();
      }
      
      // Facebook events
      if (window.location.hostname.includes('facebook') && window.location.pathname.includes('/events/')) {
        return extractFacebookEvent();
      }
      
      return null;
    }
    
    function extractEventbriteEvent() {
      const title = document.querySelector('.event-title, h1[data-automation="event-title"]')?.textContent?.trim();
      const description = document.querySelector('.event-description, [data-automation="event-description"]')?.textContent?.trim();
      const date = document.querySelector('.event-date, [data-automation="event-date"]')?.textContent?.trim();
      const location = document.querySelector('.event-location, [data-automation="event-location"]')?.textContent?.trim();
      
      if (title) {
        return {
          title,
          description: description || `Event: ${title}`,
          content: `${description || ''}\nDate: ${date || 'TBD'}\nLocation: ${location || 'TBD'}`,
          type: 'event',
          location,
          publishedAt: date,
          url: window.location.href,
          confidence: 0.8
        };
      }
      return null;
    }
    
    function extractNewsArticle() {
      const title = document.querySelector('h1, .headline, .entry-title, [data-automation="headline"]')?.textContent?.trim();
      const description = document.querySelector('.standfirst, .excerpt, .summary, [data-automation="standfirst"]')?.textContent?.trim();
      const content = document.querySelector('.article-body, .entry-content, main article')?.textContent?.trim();
      const author = document.querySelector('.byline, .author, [rel="author"]')?.textContent?.trim();
      const publishedAt = document.querySelector('time')?.getAttribute('datetime') || 
                         document.querySelector('.published-date, .date')?.textContent?.trim();
      
      if (title && (description || content)) {
        return {
          title,
          description: description || content?.slice(0, 300) + '...',
          content: content || description,
          author,
          publishedAt,
          type: 'article',
          url: window.location.href,
          confidence: 0.8
        };
      }
      return null;
    }
    
    function extractGeneralContent() {
      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.content;
      
      if (title && description) {
        return {
          title,
          description,
          content: description,
          url: window.location.href,
          confidence: 0.5
        };
      }
      return null;
    }
    
    function isNewsWebsite() {
      const newsPatterns = [
        'theguardian.com', 'bbc.co.uk', 'cnn.com', 'independent.co.uk',
        'news.', '/news/', 'article', 'story'
      ];
      const url = window.location.href.toLowerCase();
      return newsPatterns.some(pattern => url.includes(pattern));
    }
  }
  
  async findSimilarContent(query) {
    if (!this.ragEnabled) return [];
    
    try {
      const response = await fetch(`${API_BASE}/rag/search?q=${encodeURIComponent(query)}&threshold=0.8`);
      const data = await response.json();
      return data.success ? data.results : [];
    } catch (error) {
      console.error('Similar content search failed:', error);
      return [];
    }
  }
  
  async getContentSuggestions(content) {
    if (!this.ragEnabled) return null;
    
    try {
      // Use RAG system to classify and enhance content
      const response = await fetch(`${API_BASE}/rag/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: {
            ...content,
            sourceId: 'extension_' + Date.now()
          }
        })
      });
      
      const result = await response.json();
      return result.success ? result.content : null;
    } catch (error) {
      console.error('Content suggestions failed:', error);
      return null;
    }
  }
  
  showEnhancedForm(type) {
    document.getElementById('quick-actions').style.display = 'none';
    document.getElementById('submission-form').style.display = 'block';
    document.getElementById('type').value = type;
    
    // Pre-fill with smart suggestions if available
    if (this.suggestedContent) {
      this.prefillFormWithSuggestions(type);
    }
    
    this.toggleFormFields(type);
  }
  
  prefillFormWithSuggestions(type) {
    const content = this.suggestedContent;
    
    document.getElementById('title').value = content.title || '';
    document.getElementById('description').value = content.description || '';
    
    if (type === 'event') {
      if (content.location) {
        document.getElementById('location').value = content.location;
      }
      if (content.publishedAt) {
        try {
          const date = new Date(content.publishedAt);
          document.getElementById('date').value = date.toISOString().split('T')[0];
        } catch (e) {
          // Invalid date, skip
        }
      }
    }
    
    if (content.category) {
      const categoryField = document.getElementById('category');
      if (categoryField) {
        categoryField.value = content.category;
      }
    }
    
    // Show confidence indicator
    if (content.confidence) {
      this.showConfidenceIndicator(content.confidence);
    }
  }
  
  async handleEnhancedSubmit() {
    const form = document.getElementById('submission-form');
    const formData = new FormData(form);
    const submitData = Object.fromEntries(formData.entries());
    
    // Show loading state
    this.showLoadingState(true);
    
    try {
      let endpoint;
      let apiData;
      
      if (submitData.type === 'event') {
        endpoint = '/events';
        apiData = {
          title: submitData.title,
          description: submitData.description,
          date: submitData.date,
          time: submitData.time || '18:00',
          duration: parseInt(submitData.duration) || 120,
          location: {
            type: submitData.location_type || 'physical',
            address: submitData.location || 'Location TBD'
          },
          category: submitData.category || 'Community',
          status: 'draft',
          source: 'chrome_extension_rag'
        };
      } else {
        endpoint = '/articles';
        apiData = {
          title: submitData.title,
          excerpt: submitData.description,
          content: submitData.description,
          category: submitData.category || 'Community',
          author: 'Community Contributor',
          status: 'draft',
          source: 'chrome_extension_rag'
        };
      }
      
      // Submit to existing API for immediate compatibility
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Also submit to RAG system for enhanced processing
        if (this.ragEnabled) {
          await this.submitToRAGSystem({
            ...apiData,
            originalUrl: this.currentTab.url,
            sourceId: 'extension'
          });
        }
        
        this.showSuccessMessage('Content submitted successfully! It will be reviewed and published soon.');
        this.trackSubmissionSuccess(submitData.type);
        
        // Reset form after delay
        setTimeout(() => {
          this.hideForm();
          this.resetForm();
        }, 2000);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
      
    } catch (error) {
      console.error('Enhanced submission error:', error);
      this.showErrorMessage('Submission failed: ' + error.message);
    } finally {
      this.showLoadingState(false);
    }
  }
  
  async submitToRAGSystem(data) {
    try {
      await fetch(`${API_BASE}/rag/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data })
      });
    } catch (error) {
      console.log('RAG system submission failed (non-critical):', error);
    }
  }
  
  async performSmartSuggestion() {
    if (!this.ragEnabled) {
      this.showMessage('Smart suggestions require RAG system connection');
      return;
    }
    
    this.showLoadingState(true);
    
    try {
      const pageContent = await this.extractPageContent();
      
      if (!pageContent) {
        this.showMessage('Could not detect content on this page');
        return;
      }
      
      // Get enhanced suggestions
      const suggestions = await this.getContentSuggestions(pageContent);
      
      if (suggestions) {
        this.suggestedContent = suggestions;
        this.displaySmartSuggestions(suggestions);
      } else {
        this.showMessage('No smart suggestions available for this content');
      }
      
    } catch (error) {
      console.error('Smart suggestion error:', error);
      this.showErrorMessage('Smart suggestions unavailable: ' + error.message);
    } finally {
      this.showLoadingState(false);
    }
  }
  
  displaySmartSuggestions(suggestions) {
    const container = document.getElementById('smart-suggestions');
    container.innerHTML = `
      <div class="suggestions-card">
        <h4>🤖 Smart Suggestions</h4>
        <div class="suggestion-item">
          <strong>Category:</strong> ${suggestions.category || 'General'}
          <span class="confidence">Confidence: ${Math.round((suggestions.confidenceScore || 0.5) * 100)}%</span>
        </div>
        <div class="suggestion-item">
          <strong>Relevance:</strong> ${Math.round((suggestions.relevanceScore || 0.5) * 100)}% match to BLKOUT community
        </div>
        <div class="suggestion-item">
          <strong>AI Tags:</strong> ${(suggestions.aiTags || []).join(', ')}
        </div>
        <div class="suggestion-actions">
          <button onclick="blkoutPopup.acceptSuggestions()" class="btn-accept">Accept & Fill Form</button>
          <button onclick="blkoutPopup.dismissSuggestions()" class="btn-dismiss">Dismiss</button>
        </div>
      </div>
    `;
    container.style.display = 'block';
  }
  
  acceptSuggestions() {
    if (this.suggestedContent) {
      const type = this.suggestedContent.category === 'event' ? 'event' : 'article';
      this.showEnhancedForm(type);
      this.dismissSuggestions();
    }
  }
  
  dismissSuggestions() {
    document.getElementById('smart-suggestions').style.display = 'none';
  }
  
  showDuplicateWarning(similarContent) {
    const container = document.getElementById('duplicate-warning');
    container.innerHTML = `
      <div class="warning-card">
        <h4>⚠️ Similar Content Found</h4>
        <p>We found ${similarContent.length} similar item(s) already in our system:</p>
        ${similarContent.slice(0, 3).map(item => `
          <div class="similar-item">
            <strong>${item.title}</strong>
            <span class="similarity">${Math.round(item.similarity * 100)}% similar</span>
          </div>
        `).join('')}
        <div class="warning-actions">
          <button onclick="blkoutPopup.submitAnyway()" class="btn-proceed">Submit Anyway</button>
          <button onclick="blkoutPopup.dismissWarning()" class="btn-cancel">Cancel</button>
        </div>
      </div>
    `;
    container.style.display = 'block';
  }
  
  submitAnyway() {
    this.dismissWarning();
    // Proceed with normal submission
  }
  
  dismissWarning() {
    document.getElementById('duplicate-warning').style.display = 'none';
  }
  
  showBulkImportDialog() {
    // Show bulk import interface for power users
    const container = document.getElementById('bulk-import');
    container.innerHTML = `
      <div class="bulk-import-card">
        <h4>📦 Bulk Content Import</h4>
        <p>Import multiple items from current page or RSS feed:</p>
        <div class="bulk-options">
          <button onclick="blkoutPopup.scanCurrentSite()" class="btn-scan">Scan Current Site</button>
          <button onclick="blkoutPopup.importFromRSS()" class="btn-rss">Import RSS Feed</button>
        </div>
        <div class="bulk-status" id="bulk-status"></div>
      </div>
    `;
    container.style.display = 'block';
  }
  
  async scanCurrentSite() {
    const statusDiv = document.getElementById('bulk-status');
    statusDiv.innerHTML = '🔍 Scanning site for content...';
    
    try {
      // Submit current site as a source for scraping
      const response = await fetch(`${API_BASE}/rag/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: [{
            id: 'temp_' + Date.now(),
            type: 'website',
            url: this.currentTab.url,
            name: this.currentTab.title
          }],
          immediate: false
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.results.length > 0) {
        const scraped = result.results[0].scraped || 0;
        statusDiv.innerHTML = `✅ Found ${scraped} content items. They will be processed and reviewed.`;
      } else {
        statusDiv.innerHTML = '❌ No suitable content found on this page.';
      }
      
    } catch (error) {
      statusDiv.innerHTML = `❌ Error scanning site: ${error.message}`;
    }
  }
  
  // Helper methods
  showRAGStatus(status) {
    const indicator = document.getElementById('rag-status');
    const statusMap = {
      'operational': { color: 'green', text: '🤖 AI Enhanced' },
      'unavailable': { color: 'orange', text: '⚠️ Manual Only' },
      'error': { color: 'red', text: '❌ AI Offline' }
    };
    
    const config = statusMap[status];
    indicator.style.color = config.color;
    indicator.textContent = config.text;
  }
  
  showLoadingState(loading) {
    const submitBtn = document.querySelector('#submission-form button[type="submit"]');
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.textContent = '🔄 Processing...';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit to BLKOUT';
    }
  }
  
  showSuccessMessage(message) {
    this.showMessage(message, 'success');
  }
  
  showErrorMessage(message) {
    this.showMessage(message, 'error');
  }
  
  showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
  
  trackSubmissionSuccess(type) {
    // Track successful submissions for analytics
    try {
      chrome.storage.local.get(['submissionStats'], (result) => {
        const stats = result.submissionStats || { events: 0, articles: 0 };
        stats[type + 's']++;
        stats.lastSubmission = Date.now();
        chrome.storage.local.set({ submissionStats: stats });
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  }
  
  // ... other helper methods
  hideForm() {
    document.getElementById('submission-form').style.display = 'none';
    document.getElementById('quick-actions').style.display = 'block';
    this.dismissSuggestions();
    this.dismissWarning();
  }
  
  resetForm() {
    document.getElementById('submission-form').reset();
    this.suggestedContent = null;
  }
  
  toggleFormFields(type) {
    // Show/hide fields based on content type
    const eventFields = document.querySelectorAll('.event-only');
    const articleFields = document.querySelectorAll('.article-only');
    
    eventFields.forEach(field => {
      field.style.display = type === 'event' ? 'block' : 'none';
    });
    
    articleFields.forEach(field => {
      field.style.display = type === 'article' ? 'block' : 'none';
    });
  }
}

// Initialize when popup loads
let blkoutPopup;
document.addEventListener('DOMContentLoaded', () => {
  blkoutPopup = new BlkoutRAGPopup();
});