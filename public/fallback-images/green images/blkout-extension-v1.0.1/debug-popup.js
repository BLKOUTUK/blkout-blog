// Enhanced debug version of popup.js with extensive logging
const API_BASE = 'https://blkout-beta.vercel.app/api';

class BlkoutPopupDebug {
  constructor() {
    this.currentTab = null;
    this.detectedContent = null;
    this.init();
  }
  
  async init() {
    console.log('🚀 BlkoutPopup Debug - Initializing...');
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;
    console.log('📍 Current tab:', this.currentTab?.url);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Scan current page
    await this.scanCurrentPage();
  }
  
  setupEventListeners() {
    console.log('🎧 Setting up event listeners...');
    
    // Quick action buttons
    document.getElementById('submit-event').addEventListener('click', () => {
      console.log('🎉 Submit Event clicked');
      this.showForm('event');
    });
    
    document.getElementById('submit-article').addEventListener('click', () => {
      console.log('📰 Submit Article clicked');
      this.showForm('article');
    });
    
    // Form type change
    document.getElementById('type').addEventListener('change', (e) => {
      console.log('🔄 Form type changed to:', e.target.value);
      this.toggleFormFields(e.target.value);
    });
    
    // Form submission
    document.getElementById('submission-form').addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('📤 Form submitted');
      this.handleSubmit();
    });
    
    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
      console.log('❌ Cancel clicked');
      this.hideForm();
    });
  }
  
  async scanCurrentPage() {
    console.log('🔍 Scanning current page for content...');
    
    try {
      // Inject content script to detect content
      const results = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: this.detectPageContent
      });
      
      console.log('🔍 Script execution results:', results);
      
      if (results && results[0] && results[0].result) {
        this.detectedContent = results[0].result;
        console.log('✅ Content detected:', this.detectedContent);
        this.updateDetectionStatus(true);
      } else {
        console.log('❌ No content detected');
        this.updateDetectionStatus(false);
      }
    } catch (error) {
      console.error('💥 Error scanning page:', error);
      this.updateDetectionStatus(false);
    }
  }
  
  // Content detection function (injected into page)
  detectPageContent() {
    console.log('🔍 detectPageContent() - Starting detection...');
    
    const url = window.location.href;
    const hostname = window.location.hostname;
    const title = document.querySelector('h1')?.textContent?.trim() || 
                 document.title?.trim();
    
    console.log('🌐 URL:', url);
    console.log('🏠 Hostname:', hostname);
    console.log('📝 Title:', title);
    
    // News platform detection
    if (hostname.includes('theguardian.com')) {
      console.log('📰 Detected Guardian site');
      const headline = document.querySelector('h1[data-gu-name="headline"]')?.textContent?.trim() ||
                      document.querySelector('.content__headline')?.textContent?.trim() ||
                      document.querySelector('h1')?.textContent?.trim();
      
      const standfirst = document.querySelector('[data-gu-name="standfirst"]')?.textContent?.trim();
      const content = document.querySelector('[data-gu-name="body"]')?.textContent?.trim();
      const author = document.querySelector('[data-gu-name="author"]')?.textContent?.trim();
      
      console.log('📰 Guardian - Headline:', headline?.substring(0, 100));
      console.log('📰 Guardian - Standfirst:', standfirst?.substring(0, 100));
      console.log('📰 Guardian - Content length:', content?.length);
      console.log('📰 Guardian - Author:', author);
      
      if (headline && (content || standfirst)) {
        const result = {
          type: 'article',
          platform: 'guardian',
          title: headline,
          description: standfirst || content?.substring(0, 300),
          author: author || 'The Guardian',
          url
        };
        console.log('✅ Guardian content detected:', result);
        return result;
      }
    }
    
    if (hostname.includes('bbc.co.uk') || hostname.includes('bbc.com')) {
      console.log('📰 Detected BBC site');
      const headline = document.querySelector('h1[data-testid="headline"]')?.textContent?.trim() ||
                      document.querySelector('[data-component="headline"]')?.textContent?.trim() ||
                      document.querySelector('h1')?.textContent?.trim();
      
      const content = document.querySelector('[data-component="text-block"]')?.textContent?.trim() ||
                     document.querySelector('[data-testid="article-body"]')?.textContent?.trim();
      
      console.log('📰 BBC - Headline:', headline?.substring(0, 100));
      console.log('📰 BBC - Content length:', content?.length);
      
      if (headline && content) {
        const result = {
          type: 'article',
          platform: 'bbc',
          title: headline,
          description: content.substring(0, 300),
          author: 'BBC News',
          url
        };
        console.log('✅ BBC content detected:', result);
        return result;
      }
    }
    
    // Generic content detection
    console.log('🔍 Trying generic content detection...');
    const content = document.querySelector('article')?.textContent?.trim() ||
                   document.querySelector('main')?.textContent?.trim() ||
                   document.querySelector('.content')?.textContent?.trim() ||
                   document.body?.textContent?.trim();
    
    console.log('📝 Generic - Title:', title?.substring(0, 100));
    console.log('📝 Generic - Content length:', content?.length);
    
    if (title && content && content.length > 200) {
      // Check for event keywords
      const eventKeywords = ['event', 'workshop', 'conference', 'meetup', 'gathering', 'protest', 'march', 'rally', 'celebration'];
      const isEvent = eventKeywords.some(keyword => 
        title.toLowerCase().includes(keyword) || 
        content.toLowerCase().substring(0, 500).includes(keyword)
      );
      
      const result = {
        type: isEvent ? 'event' : 'article',
        platform: 'generic',
        title,
        description: content.substring(0, 300),
        url
      };
      console.log('✅ Generic content detected:', result);
      return result;
    }
    
    console.log('❌ No content detected on this page');
    return null;
  }
  
  updateDetectionStatus(found) {
    console.log('🔄 Updating detection status:', found);
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
    console.log('📝 Showing form for type:', type);
    console.log('📋 Detected content:', this.detectedContent);
    
    document.querySelector('.quick-actions').style.display = 'none';
    document.getElementById('submission-form').style.display = 'block';
    
    // Pre-fill form if content was detected
    if (this.detectedContent) {
      console.log('🔄 Pre-filling form with detected content');
      document.getElementById('type').value = this.detectedContent.type || type;
      document.getElementById('title').value = this.detectedContent.title || '';
      document.getElementById('description').value = this.detectedContent.description || '';
      
      console.log('📝 Form pre-filled:');
      console.log('  - Type:', this.detectedContent.type || type);
      console.log('  - Title:', this.detectedContent.title || '');
      console.log('  - Description:', this.detectedContent.description?.substring(0, 100) || '');
      
      if (this.detectedContent.type === 'event' && this.detectedContent.location) {
        document.getElementById('event-location').value = this.detectedContent.location;
        console.log('  - Location:', this.detectedContent.location);
      }
    } else {
      console.log('📝 No detected content, using manual values');
      document.getElementById('type').value = type;
      document.getElementById('title').value = this.currentTab.title || '';
    }
    
    this.toggleFormFields(document.getElementById('type').value);
  }
  
  hideForm() {
    console.log('🚪 Hiding form');
    document.querySelector('.quick-actions').style.display = 'grid';
    document.getElementById('submission-form').style.display = 'none';
    document.getElementById('status-message').innerHTML = '';
  }
  
  toggleFormFields(type) {
    console.log('🔄 Toggling form fields for type:', type);
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
    console.log('🚀 handleSubmit() - Starting submission process...');
    
    const formData = new FormData(document.getElementById('submission-form'));
    const type = formData.get('type');
    
    console.log('📋 Form data collected:');
    console.log('  - Type:', type);
    console.log('  - Title:', formData.get('title'));
    console.log('  - Description:', formData.get('description')?.substring(0, 100));
    
    const submitData = {
      title: formData.get('title'),
      description: formData.get('description'),
      sourceUrl: this.currentTab.url,
      detectedAt: new Date().toISOString(),
      submittedVia: 'chrome-extension-debug'
    };
    
    console.log('📦 Base submit data:', submitData);
    
    if (type === 'event') {
      console.log('🎉 Processing as event...');
      // Event-specific fields
      submitData.date = formData.get('date') || new Date().toISOString().split('T')[0];
      submitData.time = formData.get('time') || '18:00';
      submitData.duration = 120;
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
      console.log('📰 Processing as article...');
      // Article-specific fields - match API structure
      submitData.excerpt = submitData.description;
      submitData.content = submitData.description;
      submitData.category = formData.get('category') || 'Community Response';
      submitData.priority = 'medium';
      submitData.type = 'community_response';
      submitData.author = 'Community Submitted';
      submitData.status = 'draft';
      submitData.tags = ['community-submitted'];
      submitData.featured = false;
      
      // Remove description since API uses excerpt/content
      delete submitData.description;
    }
    
    console.log('📦 Final submit data:', submitData);
    
    this.showStatus('Submitting...', 'info');
    
    try {
      const endpoint = type === 'event' ? '/events' : '/articles';
      const fullUrl = API_BASE + endpoint;
      
      console.log('🌐 Submitting to:', fullUrl);
      console.log('📤 Request payload:', JSON.stringify(submitData, null, 2));
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseData = await response.json();
      console.log('📥 Response data:', responseData);
      
      if (response.ok && responseData.success) {
        console.log('✅ Submission successful!');
        this.showStatus('✅ Successfully submitted to BLKOUT! Moderators will review it shortly.', 'success');
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        console.error('❌ Submission failed:', responseData);
        throw new Error(`Submission failed: ${responseData.message || responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Submission error:', error);
      this.showStatus(`❌ Submission failed: ${error.message}. Please try again or use the website directly.`, 'error');
    }
  }
  
  showStatus(message, type) {
    console.log(`📢 Status (${type}):`, message);
    const statusEl = document.getElementById('status-message');
    statusEl.innerHTML = message;
    statusEl.className = `status-message status-${type}`;
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎬 DOM loaded, initializing debug popup...');
  new BlkoutPopupDebug();
});