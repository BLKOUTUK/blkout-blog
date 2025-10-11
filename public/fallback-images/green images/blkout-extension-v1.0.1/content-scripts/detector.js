// BLKOUT Content Detection Script
class BlkoutContentDetector {
  constructor() {
    this.eventSelectors = [
      '[data-testid*="event"]',
      '.event-info',
      '[class*="event"]',
      '[id*="event"]'
    ];
    
    this.articleSelectors = [
      'article',
      '[role="article"]',
      '.post-content',
      '.article-content',
      '.story-content',
      '.news-content',
      '[data-testid="article-body"]',
      '.entry-content',
      'main'
    ];
    
    this.newsSelectors = [
      '.headline',
      '.article-headline',
      '.story-headline',
      'h1[class*="headline"]',
      '[data-testid="headline"]'
    ];
    
    this.init();
  }
  
  init() {
    this.detectContent();
    this.addFloatingButton();
  }
  
  detectContent() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    // Platform-specific detection
    if (hostname.includes('eventbrite')) {
      this.detectEventbriteEvent();
    } else if (hostname.includes('facebook')) {
      this.detectFacebookEvent();
    } else if (hostname.includes('meetup')) {
      this.detectMeetupEvent();
    } else if (hostname.includes('theguardian.com')) {
      this.detectGuardianArticle();
    } else if (hostname.includes('bbc.co.uk') || hostname.includes('bbc.com')) {
      this.detectBBCArticle();
    } else if (hostname.includes('independent.co.uk')) {
      this.detectIndependentArticle();
    } else if (hostname.includes('novara') || hostname.includes('twitter.com') || hostname.includes('x.com')) {
      this.detectSocialMediaContent();
    } else {
      this.detectGenericContent();
    }
  }
  
  detectEventbriteEvent() {
    const title = document.querySelector('h1[data-automation="event-title"]')?.textContent?.trim();
    const description = document.querySelector('[data-automation="event-description"]')?.textContent?.trim();
    const dateTime = document.querySelector('[data-automation="event-date-time"]')?.textContent?.trim();
    const location = document.querySelector('[data-automation="event-location"]')?.textContent?.trim();
    
    if (title) {
      this.foundContent = {
        type: 'event',
        platform: 'eventbrite',
        title,
        description: description?.substring(0, 500) + '...',
        dateTime,
        location,
        url: window.location.href
      };
      this.highlightContent();
    }
  }
  
  detectFacebookEvent() {
    const title = document.querySelector('[data-testid="event-title"]')?.textContent?.trim();
    const description = document.querySelector('[data-testid="event-description"]')?.textContent?.trim();
    
    if (title) {
      this.foundContent = {
        type: 'event',
        platform: 'facebook',
        title,
        description: description?.substring(0, 500) + '...',
        url: window.location.href
      };
      this.highlightContent();
    }
  }
  
  detectMeetupEvent() {
    const title = document.querySelector('h1')?.textContent?.trim();
    const description = document.querySelector('[data-testid="description"]')?.textContent?.trim();
    
    if (title && title.length > 10) {
      this.foundContent = {
        type: 'event',
        platform: 'meetup',
        title,
        description: description?.substring(0, 500) + '...',
        url: window.location.href
      };
      this.highlightContent();
    }
  }
  
  detectGuardianArticle() {
    const title = document.querySelector('h1[data-gu-name="headline"]')?.textContent?.trim() ||
                 document.querySelector('.content__headline')?.textContent?.trim() ||
                 document.querySelector('h1')?.textContent?.trim();
    
    const standfirst = document.querySelector('[data-gu-name="standfirst"]')?.textContent?.trim();
    const content = document.querySelector('[data-gu-name="body"]')?.textContent?.trim() ||
                   document.querySelector('.content__article-body')?.textContent?.trim();
    
    const author = document.querySelector('[data-gu-name="author"]')?.textContent?.trim() ||
                  document.querySelector('.byline')?.textContent?.trim();
    
    if (title && (content || standfirst)) {
      this.foundContent = {
        type: 'article',
        platform: 'guardian',
        title,
        description: standfirst || content?.substring(0, 300) + '...',
        author: author || 'The Guardian',
        category: this.categorizeNews(title, content),
        url: window.location.href
      };
      this.highlightContent();
    }
  }
  
  detectBBCArticle() {
    const title = document.querySelector('h1[data-testid="headline"]')?.textContent?.trim() ||
                 document.querySelector('[data-component="headline"]')?.textContent?.trim() ||
                 document.querySelector('h1')?.textContent?.trim();
    
    const content = document.querySelector('[data-component="text-block"]')?.textContent?.trim() ||
                   document.querySelector('[data-testid="article-body"]')?.textContent?.trim() ||
                   document.querySelector('main')?.textContent?.trim();
    
    if (title && content && content.length > 100) {
      this.foundContent = {
        type: 'article',
        platform: 'bbc',
        title,
        description: content.substring(0, 300) + '...',
        author: 'BBC News',
        category: this.categorizeNews(title, content),
        url: window.location.href
      };
      this.highlightContent();
    }
  }
  
  detectIndependentArticle() {
    const title = document.querySelector('h1')?.textContent?.trim();
    const content = document.querySelector('.sc-1tw5ko3-3')?.textContent?.trim() ||
                   document.querySelector('article')?.textContent?.trim();
    
    const author = document.querySelector('[data-testid="author-name"]')?.textContent?.trim();
    
    if (title && content && content.length > 100) {
      this.foundContent = {
        type: 'article',
        platform: 'independent',
        title,
        description: content.substring(0, 300) + '...',
        author: author || 'The Independent',
        category: this.categorizeNews(title, content),
        url: window.location.href
      };
      this.highlightContent();
    }
  }
  
  detectSocialMediaContent() {
    const hostname = window.location.hostname;
    let title, content, author;
    
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      title = document.querySelector('[data-testid="tweetText"]')?.textContent?.trim();
      content = title;
      author = document.querySelector('[data-testid="User-Name"]')?.textContent?.trim();
    } else if (hostname.includes('novara')) {
      title = document.querySelector('h1')?.textContent?.trim();
      content = document.querySelector('.entry-content')?.textContent?.trim() ||
               document.querySelector('article')?.textContent?.trim();
      author = 'Novara Media';
    }
    
    if (title && title.length > 20) {
      this.foundContent = {
        type: 'article',
        platform: hostname.includes('twitter') || hostname.includes('x.com') ? 'twitter' : 'social',
        title: title.length > 100 ? title.substring(0, 100) + '...' : title,
        description: content?.substring(0, 300) + '...',
        author: author || 'Social Media',
        category: 'community-response',
        url: window.location.href
      };
      this.highlightContent();
    }
  }
  
  categorizeNews(title, content) {
    const text = (title + ' ' + content).toLowerCase();
    
    // Liberation/social justice keywords
    if (text.includes('racism') || text.includes('discrimination') || 
        text.includes('protest') || text.includes('black') || 
        text.includes('liberation') || text.includes('justice') || 
        text.includes('community') || text.includes('activism')) {
      return 'original';
    }
    
    // Political/systemic keywords
    if (text.includes('police') || text.includes('government') || 
        text.includes('policy') || text.includes('rights')) {
      return 'curated';
    }
    
    return 'community-response';
  }
  
  detectGenericContent() {
    // Try to detect articles or events from generic sites
    const title = document.querySelector('h1')?.textContent?.trim() || 
                 document.querySelector('title')?.textContent?.trim();
    
    const content = document.querySelector('article')?.textContent?.trim() ||
                   document.querySelector('main')?.textContent?.trim() ||
                   document.querySelector('.content')?.textContent?.trim();
    
    if (title && content && content.length > 200) {
      // Determine if it's likely an event or article
      const eventKeywords = ['event', 'workshop', 'conference', 'meetup', 'gathering', 'protest', 'march', 'rally'];
      const isEvent = eventKeywords.some(keyword => 
        title.toLowerCase().includes(keyword) || 
        content.toLowerCase().includes(keyword)
      );
      
      this.foundContent = {
        type: isEvent ? 'event' : 'article',
        platform: 'generic',
        title,
        description: content.substring(0, 500) + '...',
        author: isEvent ? 'Community Submitted' : 'Web Article',
        category: isEvent ? 'Community' : 'community-response',
        url: window.location.href
      };
    }
  }
  
  highlightContent() {
    if (!this.foundContent) return;
    
    // Add subtle highlighting to detected content
    const style = document.createElement('style');
    style.textContent = `
      .blkout-detected {
        outline: 2px dashed #4CAF50 !important;
        outline-offset: 2px !important;
      }
      .blkout-floating-btn {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        z-index: 9999 !important;
        background: #000 !important;
        color: white !important;
        border: none !important;
        padding: 10px 15px !important;
        border-radius: 20px !important;
        cursor: pointer !important;
        font-size: 12px !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
      }
      .blkout-floating-btn:hover {
        background: #333 !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  addFloatingButton() {
    if (!this.foundContent) return;
    
    const button = document.createElement('button');
    button.className = 'blkout-floating-btn';
    button.textContent = `📤 Submit ${this.foundContent.type} to BLKOUT`;
    button.title = `Detected: ${this.foundContent.title}`;
    
    button.addEventListener('click', () => {
      this.showQuickSubmissionForm();
    });
    
    document.body.appendChild(button);
  }
  
  showQuickSubmissionForm() {
    // Create and show the submission form with pre-filled data
    const event = new CustomEvent('blkout-show-submission', {
      detail: this.foundContent
    });
    document.dispatchEvent(event);
  }
}

// Initialize detector when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new BlkoutContentDetector());
} else {
  new BlkoutContentDetector();
}