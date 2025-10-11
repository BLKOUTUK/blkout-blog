// BLKOUT Extension Background Service Worker
const API_BASE = 'https://blkout-website.vercel.app/api';

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'submitToBlkout',
    title: 'Submit to BLKOUT',
    contexts: ['selection', 'link', 'page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'submitToBlkout') {
    // Inject content script to show submission form
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showSubmissionOverlay,
      args: [info]
    });
  }
});

// Content script injection function
function showSubmissionOverlay(info) {
  // Create overlay for quick submission
  const overlay = document.createElement('div');
  overlay.id = 'blkout-submission-overlay';
  overlay.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
                align-items: center; justify-content: center;">
      <div style="background: white; padding: 20px; border-radius: 8px; 
                  max-width: 500px; width: 90%;">
        <h3>Submit to BLKOUT</h3>
        <form id="blkout-quick-form">
          <div style="margin-bottom: 15px;">
            <label>Type:</label>
            <select id="submission-type" style="width: 100%; padding: 8px;">
              <option value="event">Event</option>
              <option value="article">Article/Story</option>
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label>Title:</label>
            <input type="text" id="submission-title" style="width: 100%; padding: 8px;" 
                   value="${info.selectionText || document.title || ''}" />
          </div>
          <div style="margin-bottom: 15px;">
            <label>Description:</label>
            <textarea id="submission-description" style="width: 100%; padding: 8px; height: 80px;"
                      placeholder="Auto-detected or manual entry..."></textarea>
          </div>
          <div style="display: flex; gap: 10px;">
            <button type="submit" style="flex: 1; padding: 10px; background: #000; color: white; border: none; border-radius: 4px;">
              Submit
            </button>
            <button type="button" onclick="this.closest('#blkout-submission-overlay').remove()" 
                    style="flex: 1; padding: 10px; background: #ccc; border: none; border-radius: 4px;">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Handle form submission
  document.getElementById('blkout-quick-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const type = document.getElementById('submission-type').value;
    const title = document.getElementById('submission-title').value;
    const description = document.getElementById('submission-description').value;
    
    const submitData = {
      title,
      description,
      sourceUrl: window.location.href,
      detectedAt: new Date().toISOString(),
      submittedVia: 'chrome-extension'
    };
    
    if (type === 'event') {
      // Add event-specific fields
      submitData.date = new Date().toISOString().split('T')[0]; // Default to today
      submitData.time = '18:00'; // Default time
      submitData.organizer = 'Community Submitted';
      submitData.category = 'Community';
      submitData.location = { type: 'physical', address: 'TBD' };
      submitData.capacity = 50;
      submitData.featured = false;
      submitData.status = 'draft';
    } else {
      // Add article-specific fields
      submitData.category = 'Community Response';
      submitData.priority = 'medium';
      submitData.type = 'community-response';
      submitData.author = 'Community Submitted';
      submitData.status = 'draft';
    }
    
    try {
      const endpoint = type === 'event' ? '/events' : '/articles';
      const response = await fetch('https://blkout-website.vercel.app/api' + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        alert('✅ Successfully submitted to BLKOUT! It will be reviewed by moderators.');
        overlay.remove();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      alert('❌ Submission failed. Please try again or use the website directly.');
      console.error('Submission error:', error);
    }
  });
}

// Storage helpers
const storage = {
  async save(key, data) {
    return chrome.storage.local.set({ [key]: data });
  },
  
  async load(key) {
    const result = await chrome.storage.local.get([key]);
    return result[key];
  }
};