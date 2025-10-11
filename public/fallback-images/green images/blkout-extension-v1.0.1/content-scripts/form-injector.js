// BLKOUT Form Injection Script
class BlkoutFormInjector {
  constructor() {
    this.overlayId = 'blkout-submission-overlay';
    this.init();
  }
  
  init() {
    // Listen for custom events from detector
    document.addEventListener('blkout-show-submission', (event) => {
      this.showSubmissionForm(event.detail);
    });
    
    // Listen for messages from background script
    chrome.runtime.onMessage?.addListener((request, sender, sendResponse) => {
      if (request.action === 'showSubmissionForm') {
        this.showSubmissionForm(request.data);
      }
    });
  }
  
  showSubmissionForm(contentData = null) {
    // Remove existing overlay if present
    this.removeOverlay();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = this.overlayId;
    overlay.innerHTML = this.createFormHTML(contentData);
    
    document.body.appendChild(overlay);
    
    // Add event listeners
    this.attachEventListeners(overlay);
  }
  
  createFormHTML(contentData) {
    const title = contentData?.title || document.title || '';
    const description = contentData?.description || '';
    const type = contentData?.type || 'event';
    const platform = contentData?.platform || 'generic';
    
    return `
      <div class="blkout-overlay-backdrop">
        <div class="blkout-form-container">
          <div class="blkout-form-header">
            <h3>📤 Submit to BLKOUT</h3>
            <button class="blkout-close-btn" onclick="this.closest('#${this.overlayId}').remove()">✕</button>
          </div>
          
          <form id="blkout-quick-form" class="blkout-form">
            <div class="blkout-form-group">
              <label>Type:</label>
              <select id="submission-type" required>
                <option value="event" ${type === 'event' ? 'selected' : ''}>Event</option>
                <option value="article" ${type === 'article' ? 'selected' : ''}>Article/Story</option>
              </select>
            </div>
            
            <div class="blkout-form-group">
              <label>Title:</label>
              <input 
                type="text" 
                id="submission-title" 
                value="${this.escapeHtml(title)}" 
                required
                placeholder="Enter title..."
              />
            </div>
            
            <div class="blkout-form-group">
              <label>Description:</label>
              <textarea 
                id="submission-description"
                placeholder="Brief description or auto-detected content..."
                rows="3"
              >${this.escapeHtml(description)}</textarea>
            </div>
            
            <!-- Event-specific fields -->
            <div id="event-fields" style="display: ${type === 'event' ? 'block' : 'none'}">
              <div class="blkout-form-row">
                <div class="blkout-form-group">
                  <label>Date:</label>
                  <input type="date" id="event-date" value="${this.getTodayDate()}" />
                </div>
                <div class="blkout-form-group">
                  <label>Time:</label>
                  <input type="time" id="event-time" value="18:00" />
                </div>
              </div>
              
              <div class="blkout-form-group">
                <label>Location:</label>
                <input 
                  type="text" 
                  id="event-location" 
                  placeholder="Event location or 'Online'"
                  value="${contentData?.location || ''}"
                />
              </div>
            </div>
            
            <!-- Article-specific fields -->
            <div id="article-fields" style="display: ${type === 'article' ? 'block' : 'none'}">
              <div class="blkout-form-group">
                <label>Category:</label>
                <select id="article-category">
                  <option value="community-response">Community Response</option>
                  <option value="original">Original</option>
                  <option value="curated">Curated</option>
                </select>
              </div>
              
              <div class="blkout-form-group">
                <label>Author:</label>
                <input 
                  type="text" 
                  id="article-author" 
                  value="${contentData?.author || 'Community Submitted'}"
                  placeholder="Author name"
                />
              </div>
            </div>
            
            <div class="blkout-detected-info">
              ${platform !== 'generic' ? `<small>📍 Detected from: ${platform}</small>` : ''}
              ${contentData?.sourceUrl ? `<small>🔗 Source: ${new URL(contentData.sourceUrl).hostname}</small>` : ''}
            </div>
            
            <div class="blkout-form-actions">
              <button type="submit" class="blkout-btn-primary">
                📤 Submit to BLKOUT
              </button>
              <button type="button" class="blkout-btn-secondary" onclick="this.closest('#${this.overlayId}').remove()">
                Cancel
              </button>
            </div>
            
            <div id="submission-status" class="blkout-status-message" style="display: none;"></div>
          </form>
        </div>
      </div>
    `;
  }
  
  attachEventListeners(overlay) {
    const form = overlay.querySelector('#blkout-quick-form');
    const typeSelect = overlay.querySelector('#submission-type');
    
    // Handle type change
    typeSelect.addEventListener('change', (e) => {
      const type = e.target.value;
      overlay.querySelector('#event-fields').style.display = type === 'event' ? 'block' : 'none';
      overlay.querySelector('#article-fields').style.display = type === 'article' ? 'block' : 'none';
    });
    
    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmission(overlay);
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.removeOverlay();
      }
    });
  }
  
  async handleSubmission(overlay) {
    const form = overlay.querySelector('#blkout-quick-form');
    const statusDiv = overlay.querySelector('#submission-status');
    const submitBtn = overlay.querySelector('.blkout-btn-primary');
    
    // Show loading state
    submitBtn.textContent = '⏳ Submitting...';
    submitBtn.disabled = true;
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = '🔄 Submitting to BLKOUT...';
    statusDiv.className = 'blkout-status-message blkout-status-loading';
    
    try {
      const formData = new FormData(form);
      const type = overlay.querySelector('#submission-type').value;
      
      const submitData = {
        title: overlay.querySelector('#submission-title').value,
        description: overlay.querySelector('#submission-description').value,
        sourceUrl: window.location.href,
        detectedAt: new Date().toISOString(),
        submittedVia: 'chrome-extension'
      };
      
      if (type === 'event') {
        // Event-specific data
        submitData.date = overlay.querySelector('#event-date').value || this.getTodayDate();
        submitData.time = overlay.querySelector('#event-time').value || '18:00';
        submitData.organizer = 'Community Submitted';
        submitData.category = 'Community';
        submitData.location = {
          type: 'physical',
          address: overlay.querySelector('#event-location').value || 'TBD'
        };
        submitData.capacity = 50;
        submitData.featured = false;
        submitData.status = 'draft';
        submitData.tags = ['community-submitted'];
      } else {
        // Article-specific data
        submitData.category = overlay.querySelector('#article-category').value;
        submitData.author = overlay.querySelector('#article-author').value || 'Community Submitted';
        submitData.type = overlay.querySelector('#article-category').value;
        submitData.priority = 'medium';
        submitData.status = 'draft';
        submitData.tags = ['community-submitted'];
      }
      
      const endpoint = type === 'event' ? '/events' : '/articles';
      const response = await fetch(`https://blkout-website.vercel.app/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        statusDiv.innerHTML = '✅ Successfully submitted to BLKOUT! Moderators will review it shortly.';
        statusDiv.className = 'blkout-status-message blkout-status-success';
        
        setTimeout(() => {
          this.removeOverlay();
        }, 2000);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('BLKOUT Extension submission error:', error);
      statusDiv.innerHTML = '❌ Submission failed. Please try again or use the website directly.';
      statusDiv.className = 'blkout-status-message blkout-status-error';
      
      submitBtn.textContent = '📤 Submit to BLKOUT';
      submitBtn.disabled = false;
    }
  }
  
  removeOverlay() {
    const existing = document.getElementById(this.overlayId);
    if (existing) {
      existing.remove();
    }
  }
  
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }
}

// Initialize form injector when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new BlkoutFormInjector());
} else {
  new BlkoutFormInjector();
}