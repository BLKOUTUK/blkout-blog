// BLKOUT Extension Popup Logic
const API_BASE = 'https://blkout-beta.vercel.app/api';

class BlkoutPopup {
  constructor() {
    this.currentTab = null;
    this.detectedContent = null;
    this.init();
  }
  
  async init() {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Scan current page
    this.scanCurrentPage();
  }
  
  setupEventListeners() {
    // Quick action buttons
    document.getElementById('submit-event').addEventListener('click', () => {
      this.showForm('event');
    });
    
    document.getElementById('submit-article').addEventListener('click', () => {
      this.showForm('article');
    });
    
    // Form type change
    document.getElementById('type').addEventListener('change', (e) => {
      this.toggleFormFields(e.target.value);
    });
    
    // Form submission
    document.getElementById('submission-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
      this.hideForm();
    });
  }
  
  async scanCurrentPage() {
    try {
      // Inject content script to detect content
      const results = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: this.detectPageContent
      });
      
      if (results && results[0] && results[0].result) {
        this.detectedContent = results[0].result;
        this.updateDetectionStatus(true);
      } else {
        this.updateDetectionStatus(false);
      }
    } catch (error) {
      console.error('Error scanning page:', error);
      this.updateDetectionStatus(false);
    }
  }
  
  // Content detection function (injected into page)
  detectPageContent() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    const title = document.querySelector('h1')?.textContent?.trim() || 
                 document.title?.trim();
    
    // News platform detection
    if (hostname.includes('theguardian.com')) {
      const headline = document.querySelector('h1[data-gu-name="headline"]')?.textContent?.trim() ||
                      document.querySelector('.content__headline')?.textContent?.trim() ||
                      document.querySelector('h1')?.textContent?.trim();
      
      const standfirst = document.querySelector('[data-gu-name="standfirst"]')?.textContent?.trim();
      const content = document.querySelector('[data-gu-name="body"]')?.textContent?.trim();
      const author = document.querySelector('[data-gu-name="author"]')?.textContent?.trim();
      
      if (headline && (content || standfirst)) {
        return {
          type: 'article',
          platform: 'guardian',
          title: headline,
          description: standfirst || content?.substring(0, 300),
          author: author || 'The Guardian',
          url
        };
      }
    }
    
    if (hostname.includes('bbc.co.uk') || hostname.includes('bbc.com')) {
      const headline = document.querySelector('h1[data-testid="headline"]')?.textContent?.trim() ||
                      document.querySelector('[data-component="headline"]')?.textContent?.trim() ||
                      document.querySelector('h1')?.textContent?.trim();
      
      const content = document.querySelector('[data-component="text-block"]')?.textContent?.trim() ||
                     document.querySelector('[data-testid="article-body"]')?.textContent?.trim();
      
      if (headline && content) {
        return {
          type: 'article',
          platform: 'bbc',
          title: headline,
          description: content.substring(0, 300),
          author: 'BBC News',
          url
        };
      }
    }
    
    if (hostname.includes('independent.co.uk')) {
      const headline = document.querySelector('h1')?.textContent?.trim();
      const content = document.querySelector('.sc-1tw5ko3-3')?.textContent?.trim() ||
                     document.querySelector('article')?.textContent?.trim();
      const author = document.querySelector('[data-testid="author-name"]')?.textContent?.trim();
      
      if (headline && content) {
        return {
          type: 'article',
          platform: 'independent',
          title: headline,
          description: content.substring(0, 300),
          author: author || 'The Independent',
          url
        };
      }
    }
    
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      const tweetText = document.querySelector('[data-testid="tweetText"]')?.textContent?.trim();
      const userName = document.querySelector('[data-testid="User-Name"]')?.textContent?.trim();
      
      if (tweetText && tweetText.length > 20) {
        return {
          type: 'article',
          platform: 'twitter',
          title: tweetText.length > 100 ? tweetText.substring(0, 100) + '...' : tweetText,
          description: tweetText,
          author: userName || 'Twitter User',
          url
        };
      }
    }
    
    // Platform-specific detection
    if (hostname.includes('eventbrite.com')) {
      const eventTitle = document.querySelector('h1[data-automation="event-title"]')?.textContent?.trim();
      const description = document.querySelector('[data-automation="event-description"]')?.textContent?.trim();
      const dateTime = document.querySelector('[data-automation="event-date-time"]')?.textContent?.trim();
      const location = document.querySelector('[data-automation="event-location"]')?.textContent?.trim();
      
      if (eventTitle) {
        return {
          type: 'event',
          platform: 'eventbrite',
          title: eventTitle,
          description: description?.substring(0, 300),
          dateTime,
          location,
          url
        };
      }
    }
    
    if (hostname.includes('facebook.com') && url.includes('/events/')) {
      const eventTitle = document.querySelector('[data-testid="event-title"]')?.textContent?.trim() ||
                        document.querySelector('h1')?.textContent?.trim();
      const description = document.querySelector('[data-testid="event-description"]')?.textContent?.trim();
      
      if (eventTitle) {
        return {
          type: 'event',
          platform: 'facebook',
          title: eventTitle,
          description: description?.substring(0, 300),
          url
        };
      }
    }
    
    if (hostname.includes('meetup.com')) {
      const eventTitle = document.querySelector('h1')?.textContent?.trim();
      const description = document.querySelector('[data-testid="description"]')?.textContent?.trim() ||
                         document.querySelector('.event-description')?.textContent?.trim();
      
      if (eventTitle && eventTitle.length > 10) {
        return {
          type: 'event',
          platform: 'meetup',
          title: eventTitle,
          description: description?.substring(0, 300),
          url
        };
      }
    }
    
    // Generic content detection
    const content = document.querySelector('article')?.textContent?.trim() ||
                   document.querySelector('main')?.textContent?.trim() ||
                   document.querySelector('.content')?.textContent?.trim() ||
                   document.body?.textContent?.trim();
    
    if (title && content && content.length > 200) {
      // Check for event keywords
      const eventKeywords = ['event', 'workshop', 'conference', 'meetup', 'gathering', 'protest', 'march', 'rally', 'celebration'];
      const isEvent = eventKeywords.some(keyword => 
        title.toLowerCase().includes(keyword) || 
        content.toLowerCase().substring(0, 500).includes(keyword)
      );
      
      return {
        type: isEvent ? 'event' : 'article',
        platform: 'generic',
        title,
        description: content.substring(0, 300),
        url
      };
    }
    
    return null;
  }
  
  updateDetectionStatus(found) {
    const statusEl = document.getElementById('detection-status');
    
    if (found && this.detectedContent) {
      statusEl.className = 'detection-status';
      statusEl.innerHTML = `
        <strong>✅ Content Detected!</strong>
        <p><strong>${this.detectedContent.type.toUpperCase()}:</strong> ${this.detectedContent.title?.substring(0, 80)}...</p>
        <p><small>From: ${this.detectedContent.platform}</small></p>
      `;
    } else {
      statusEl.className = 'detection-status none';
      statusEl.innerHTML = `
        <strong>🔍 No content detected</strong>
        <p>Use the buttons below to manually submit content.</p>
      `;
    }
  }
  
  showForm(type) {
    document.querySelector('.quick-actions').style.display = 'none';
    document.getElementById('submission-form').style.display = 'block';
    
    // Pre-fill form if content was detected
    if (this.detectedContent) {
      document.getElementById('type').value = this.detectedContent.type || type;
      document.getElementById('title').value = this.detectedContent.title || '';
      document.getElementById('description').value = this.detectedContent.description || '';
      
      if (this.detectedContent.type === 'event' && this.detectedContent.location) {
        document.getElementById('event-location').value = this.detectedContent.location;
      }
    } else {
      document.getElementById('type').value = type;
      document.getElementById('title').value = this.currentTab.title || '';
    }
    
    this.toggleFormFields(document.getElementById('type').value);
  }
  
  hideForm() {
    document.querySelector('.quick-actions').style.display = 'grid';
    document.getElementById('submission-form').style.display = 'none';
    document.getElementById('status-message').innerHTML = '';
  }
  
  toggleFormFields(type) {
    const eventFields = document.getElementById('event-fields');
    const articleFields = document.getElementById('article-fields');
    
    if (type === 'event') {
      eventFields.style.display = 'block';
      articleFields.style.display = 'none';
      
      // Set default date to today
      if (!document.getElementById('event-date').value) {
        document.getElementById('event-date').value = new Date().toISOString().split('T')[0];
      }
    } else {
      eventFields.style.display = 'none';
      articleFields.style.display = 'block';
    }
  }
  
  async handleSubmit() {
    const formData = new FormData(document.getElementById('submission-form'));
    const type = formData.get('type');
    
    const submitData = {
      title: formData.get('title'),
      description: formData.get('description'),
      sourceUrl: this.currentTab.url,
      detectedAt: new Date().toISOString(),
      submittedVia: 'chrome-extension'
    };
    
    if (type === 'event') {
      // Event-specific fields
      submitData.date = formData.get('date') || new Date().toISOString().split('T')[0];
      submitData.time = formData.get('time') || '18:00';
      submitData.duration = 120; // Default 2 hours
      submitData.organizer = 'Community Submitted';
      submitData.category = 'Community';
      submitData.location = {
        type: 'physical',
        address: formData.get('location') || 'TBD'
      };
      submitData.capacity = 50;
      submitData.featured = false;
      submitData.status = 'draft';
      submitData.tags = ['community-submitted'];
    } else {
      // Article-specific fields - match API structure
      submitData.excerpt = submitData.description; // API expects 'excerpt' not 'description'
      submitData.content = submitData.description; // Full content same as description for now
      submitData.category = formData.get('category') || 'Community Response';
      submitData.priority = 'medium';
      submitData.type = 'community_response'; // Fixed type
      submitData.author = 'Community Submitted';
      submitData.status = 'draft';
      submitData.tags = ['community-submitted'];
      submitData.featured = false;
      
      // Remove description since API uses excerpt/content
      delete submitData.description;
    }
    
    this.showStatus('Submitting...', 'info');
    
    try {
      const endpoint = type === 'event' ? '/events' : '/articles';
      console.log('Submitting to:', API_BASE + endpoint);
      console.log('Submit data:', submitData);
      
      const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });
      
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (response.ok && responseData.success) {
        this.showStatus('✅ Successfully submitted to BLKOUT! Moderators will review it shortly.', 'success');
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        throw new Error(`Submission failed: ${responseData.message || responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      this.showStatus(`❌ Submission failed: ${error.message}. Please try again or use the website directly.`, 'error');
    }
  }
  
  showStatus(message, type) {
    const statusEl = document.getElementById('status-message');
    statusEl.innerHTML = message;
    statusEl.className = `status-message status-${type}`;
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new BlkoutPopup();
});