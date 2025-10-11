// Enhanced BLKOUT Extension Popup with Debug Logging
const API_BASE = 'https://blkout-beta.vercel.app/api';

class BlkoutPopupDebug {
  constructor() {
    this.currentTab = null;
    this.detectedContent = null;
    console.log('🚀 BLKOUT Extension - Debug Mode Initialized');
    this.init();
  }
  
  async init() {
    try {
      console.log('📍 Getting current tab...');
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      console.log('✅ Current tab:', tab?.url);
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Scan current page
      await this.scanCurrentPage();
    } catch (error) {
      console.error('💥 Init error:', error);
      this.updateDetectionStatus(false, `Init failed: ${error.message}`);
    }
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
    
    console.log('✅ Event listeners set up');
  }
  
  async scanCurrentPage() {
    console.log('🔍 Starting page scan...');
    console.log('📍 Target tab ID:', this.currentTab?.id);
    console.log('📍 Target URL:', this.currentTab?.url);
    
    try {
      // Check if we have the required permissions
      if (!chrome.scripting) {
        throw new Error('chrome.scripting API not available');
      }
      
      if (!this.currentTab || !this.currentTab.id) {
        throw new Error('No valid tab found');
      }
      
      console.log('💉 Injecting content script...');
      
      // Inject content script to detect content
      const results = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: this.detectPageContent
      });
      
      console.log('📥 Script execution results:', results);
      
      if (results && results[0]) {
        console.log('📊 Result data:', results[0].result);
        
        if (results[0].result) {
          this.detectedContent = results[0].result;
          console.log('✅ Content detected:', this.detectedContent);
          this.updateDetectionStatus(true);
        } else {
          console.log('❌ No content detected (null result)');
          this.updateDetectionStatus(false, 'No content found on this page');
        }
      } else {
        console.log('❌ No results from script execution');
        this.updateDetectionStatus(false, 'Script execution returned no results');
      }
    } catch (error) {
      console.error('💥 Error scanning page:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      this.updateDetectionStatus(false, `Scan error: ${error.message}`);
    }
  }
  
  // Content detection function (injected into page)
  detectPageContent() {
    console.log('🔍 detectPageContent() - Starting detection...');
    
    try {
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
        
        const selectors = {
          headline: 'h1[data-gu-name="headline"]',
          contentHeadline: '.content__headline',
          h1: 'h1',
          standfirst: '[data-gu-name="standfirst"]',
          body: '[data-gu-name="body"]',
          author: '[data-gu-name="author"]'
        };
        
        console.log('🔍 Testing Guardian selectors...');
        Object.entries(selectors).forEach(([name, selector]) => {
          const element = document.querySelector(selector);
          console.log(`  ${name} (${selector}):`, element ? 'FOUND' : 'NOT FOUND');
          if (element) console.log(`    Content preview:`, element.textContent?.substring(0, 100));
        });
        
        const headline = document.querySelector(selectors.headline)?.textContent?.trim() ||
                        document.querySelector(selectors.contentHeadline)?.textContent?.trim() ||
                        document.querySelector(selectors.h1)?.textContent?.trim();
        
        const standfirst = document.querySelector(selectors.standfirst)?.textContent?.trim();
        const content = document.querySelector(selectors.body)?.textContent?.trim();
        const author = document.querySelector(selectors.author)?.textContent?.trim();
        
        console.log('📰 Guardian - Extracted data:');
        console.log('  Headline:', headline?.substring(0, 100));
        console.log('  Standfirst:', standfirst?.substring(0, 100));
        console.log('  Content length:', content?.length);
        console.log('  Author:', author);
        
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
        } else {
          console.log('❌ Guardian content incomplete');
        }
      }
      
      if (hostname.includes('bbc.co.uk') || hostname.includes('bbc.com')) {
        console.log('📰 Detected BBC site');
        
        const selectors = {
          testidHeadline: 'h1[data-testid="headline"]',
          componentHeadline: '[data-component="headline"]',
          h1: 'h1',
          textBlock: '[data-component="text-block"]',
          articleBody: '[data-testid="article-body"]'
        };
        
        console.log('🔍 Testing BBC selectors...');
        Object.entries(selectors).forEach(([name, selector]) => {
          const element = document.querySelector(selector);
          console.log(`  ${name} (${selector}):`, element ? 'FOUND' : 'NOT FOUND');
        });
        
        const headline = document.querySelector(selectors.testidHeadline)?.textContent?.trim() ||
                        document.querySelector(selectors.componentHeadline)?.textContent?.trim() ||
                        document.querySelector(selectors.h1)?.textContent?.trim();
        
        const content = document.querySelector(selectors.textBlock)?.textContent?.trim() ||
                       document.querySelector(selectors.articleBody)?.textContent?.trim();
        
        console.log('📰 BBC - Extracted data:');
        console.log('  Headline:', headline?.substring(0, 100));
        console.log('  Content length:', content?.length);
        
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
        } else {
          console.log('❌ BBC content incomplete');
        }
      }
      
      // Generic content detection
      console.log('🔍 Trying generic content detection...');
      
      const contentSelectors = ['article', 'main', '.content', 'body'];
      let content = null;
      
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          content = element.textContent.trim();
          console.log(`📝 Found content via ${selector}: ${content.length} chars`);
          break;
        }
      }
      
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
      
      console.log('❌ No content detected - insufficient data');
      console.log('  Title:', title ? 'present' : 'missing');
      console.log('  Content length:', content?.length || 0);
      
      return null;
    } catch (error) {
      console.error('💥 Error in detectPageContent:', error);
      return null;
    }
  }
  
  updateDetectionStatus(found, errorMessage = null) {
    console.log('🔄 Updating detection status:', found, errorMessage);
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
      const message = errorMessage || 'No content detected';
      statusEl.innerHTML = `
        <strong>🔍 ${message}</strong>
        <p>Use the buttons below to manually submit content.</p>
        <p><small>Check browser console for debug info</small></p>
      `;
    }
  }
  
  showForm(type) {
    console.log('📝 Showing form for type:', type);
    document.querySelector('.quick-actions').style.display = 'none';
    document.getElementById('submission-form').style.display = 'block';
    
    // Pre-fill form if content was detected
    if (this.detectedContent) {
      console.log('🔄 Pre-filling form with detected content');
      document.getElementById('type').value = this.detectedContent.type || type;
      document.getElementById('title').value = this.detectedContent.title || '';
      document.getElementById('description').value = this.detectedContent.description || '';
      
      if (this.detectedContent.type === 'event' && this.detectedContent.location) {
        document.getElementById('event-location').value = this.detectedContent.location;
      }
    } else {
      console.log('📝 No detected content, using manual values');
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
      
      if (!document.getElementById('event-date').value) {
        document.getElementById('event-date').value = new Date().toISOString().split('T')[0];
      }
    } else {
      eventFields.style.display = 'none';
      articleFields.style.display = 'block';
    }
  }
  
  async handleSubmit() {
    console.log('🚀 handleSubmit() - Starting submission...');
    
    const formData = new FormData(document.getElementById('submission-form'));
    const type = formData.get('type');
    
    const submitData = {
      title: formData.get('title'),
      description: formData.get('description'),
      sourceUrl: this.currentTab.url,
      detectedAt: new Date().toISOString(),
      submittedVia: 'chrome-extension-debug'
    };
    
    if (type === 'event') {
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
      // Article-specific fields
      submitData.excerpt = submitData.description;
      submitData.content = submitData.description;
      submitData.category = formData.get('category') || 'Community Response';
      submitData.priority = 'medium';
      submitData.type = 'community_response';
      submitData.author = 'Community Submitted';
      submitData.status = 'draft';
      submitData.tags = ['community-submitted'];
      submitData.featured = false;
      
      delete submitData.description;
    }
    
    console.log('📦 Final submit data:', submitData);
    this.showStatus('Submitting...', 'info');
    
    try {
      const endpoint = type === 'event' ? '/events' : '/articles';
      console.log('🌐 Submitting to:', API_BASE + endpoint);
      
      const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });
      
      console.log('📥 Response status:', response.status);
      const responseData = await response.json();
      console.log('📥 Response data:', responseData);
      
      if (response.ok && responseData.success) {
        console.log('✅ Submission successful!');
        this.showStatus('✅ Successfully submitted to BLKOUT! Moderators will review it shortly.', 'success');
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
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