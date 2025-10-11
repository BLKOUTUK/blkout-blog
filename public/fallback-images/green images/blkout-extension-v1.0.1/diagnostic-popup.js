// BLKOUT Extension Diagnostic Tool
console.log('🔧 BLKOUT Diagnostic Extension Loaded');

class DiagnosticTool {
  constructor() {
    this.currentTab = null;
    this.init();
  }
  
  async init() {
    console.log('🚀 Initializing diagnostic tool...');
    
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      
      this.displayPageInfo();
      this.setupEventListeners();
      
      console.log('✅ Diagnostic tool initialized');
    } catch (error) {
      console.error('💥 Init error:', error);
      this.displayError('init-error', error.message);
    }
  }
  
  displayPageInfo() {
    const pageInfoEl = document.getElementById('page-info');
    if (this.currentTab) {
      pageInfoEl.innerHTML = `URL: ${this.currentTab.url}
Title: ${this.currentTab.title}
ID: ${this.currentTab.id}
Status: ${this.currentTab.status}`;
      pageInfoEl.className = 'test-result status-info';
    } else {
      pageInfoEl.innerHTML = 'No tab information available';
      pageInfoEl.className = 'test-result status-fail';
    }
  }
  
  setupEventListeners() {
    document.getElementById('test-injection').addEventListener('click', () => {
      this.testScriptInjection();
    });
    
    document.getElementById('test-detection').addEventListener('click', () => {
      this.testContentDetection();
    });
    
    document.getElementById('test-selectors').addEventListener('click', () => {
      this.testNewsSelectors();
    });
  }
  
  async testScriptInjection() {
    console.log('🔧 Testing basic script injection...');
    const resultEl = document.getElementById('injection-result');
    resultEl.innerHTML = 'Testing...';
    
    try {
      if (!chrome.scripting) {
        throw new Error('chrome.scripting API not available');
      }
      
      if (!this.currentTab || !this.currentTab.id) {
        throw new Error('No valid tab found');
      }
      
      console.log('💉 Injecting basic test script...');
      
      const results = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: () => {
          // Simple test function
          console.log('🧪 Diagnostic script executed on page');
          return {
            url: window.location.href,
            title: document.title,
            hostname: window.location.hostname,
            hasH1: !!document.querySelector('h1'),
            h1Text: document.querySelector('h1')?.textContent?.substring(0, 100),
            hasArticle: !!document.querySelector('article'),
            hasMain: !!document.querySelector('main'),
            bodyLength: document.body?.textContent?.length || 0
          };
        }
      });
      
      console.log('📥 Injection test results:', results);
      
      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        resultEl.innerHTML = `✅ INJECTION SUCCESS
URL: ${data.url}
Title: ${data.title}
Hostname: ${data.hostname}
Has H1: ${data.hasH1}
H1 Text: ${data.h1Text || 'None'}
Has Article: ${data.hasArticle}  
Has Main: ${data.hasMain}
Body Length: ${data.bodyLength} chars`;
        resultEl.className = 'test-result status-pass';
      } else {
        throw new Error('Script executed but returned no results');
      }
      
    } catch (error) {
      console.error('💥 Injection test failed:', error);
      resultEl.innerHTML = `❌ INJECTION FAILED
Error: ${error.message}
Check console for details`;
      resultEl.className = 'test-result status-fail';
    }
  }
  
  async testContentDetection() {
    console.log('🔍 Testing content detection logic...');
    const resultEl = document.getElementById('detection-result');
    resultEl.innerHTML = 'Testing...';
    
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: () => {
          console.log('🔍 Running content detection test...');
          
          const url = window.location.href;
          const hostname = window.location.hostname;
          const title = document.querySelector('h1')?.textContent?.trim() || document.title?.trim();
          
          // Test generic content detection
          const contentSelectors = ['article', 'main', '.content', 'body'];
          let content = null;
          let contentSource = '';
          
          for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent) {
              content = element.textContent.trim();
              contentSource = selector;
              break;
            }
          }
          
          const eventKeywords = ['event', 'workshop', 'conference', 'meetup', 'gathering', 'protest', 'march', 'rally', 'celebration'];
          const hasEventKeywords = eventKeywords.some(keyword => 
            title.toLowerCase().includes(keyword) || 
            (content && content.toLowerCase().substring(0, 500).includes(keyword))
          );
          
          return {
            url,
            hostname,
            title: title?.substring(0, 100),
            contentFound: !!content,
            contentLength: content?.length || 0,
            contentSource,
            hasEventKeywords,
            canDetect: !!(title && content && content.length > 200)
          };
        }
      });
      
      console.log('📊 Detection test results:', results);
      
      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        resultEl.innerHTML = `📊 DETECTION TEST RESULTS
Title Found: ${!!data.title}
Title: ${data.title || 'None'}
Content Found: ${data.contentFound}
Content Length: ${data.contentLength}
Content Source: ${data.contentSource || 'None'}
Has Event Keywords: ${data.hasEventKeywords}
Can Detect: ${data.canDetect}`;
        
        resultEl.className = data.canDetect ? 'test-result status-pass' : 'test-result status-fail';
      } else {
        throw new Error('Detection test failed');
      }
      
    } catch (error) {
      console.error('💥 Detection test failed:', error);
      resultEl.innerHTML = `❌ DETECTION TEST FAILED
Error: ${error.message}`;
      resultEl.className = 'test-result status-fail';
    }
  }
  
  async testNewsSelectors() {
    console.log('🎯 Testing news site selectors...');
    const resultEl = document.getElementById('selector-result');
    resultEl.innerHTML = 'Testing...';
    
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: () => {
          console.log('🎯 Testing news site selectors...');
          
          const hostname = window.location.hostname;
          const results = {
            hostname,
            isGuardian: hostname.includes('theguardian.com'),
            isBBC: hostname.includes('bbc.co.uk') || hostname.includes('bbc.com'),
            guardianTests: {},
            bbcTests: {}
          };
          
          // Test Guardian selectors
          if (results.isGuardian) {
            const guardianSelectors = {
              'headline': 'h1[data-gu-name="headline"]',
              'contentHeadline': '.content__headline',
              'h1': 'h1',
              'standfirst': '[data-gu-name="standfirst"]',
              'body': '[data-gu-name="body"]',
              'author': '[data-gu-name="author"]'
            };
            
            Object.entries(guardianSelectors).forEach(([name, selector]) => {
              const element = document.querySelector(selector);
              results.guardianTests[name] = {
                found: !!element,
                text: element?.textContent?.substring(0, 50) || null
              };
            });
          }
          
          // Test BBC selectors  
          if (results.isBBC) {
            const bbcSelectors = {
              'testidHeadline': 'h1[data-testid="headline"]',
              'componentHeadline': '[data-component="headline"]',
              'h1': 'h1',
              'textBlock': '[data-component="text-block"]',
              'articleBody': '[data-testid="article-body"]'
            };
            
            Object.entries(bbcSelectors).forEach(([name, selector]) => {
              const element = document.querySelector(selector);
              results.bbcTests[name] = {
                found: !!element,
                text: element?.textContent?.substring(0, 50) || null
              };
            });
          }
          
          return results;
        }
      });
      
      console.log('🎯 Selector test results:', results);
      
      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        let output = `🎯 NEWS SITE SELECTOR TEST
Hostname: ${data.hostname}
Is Guardian: ${data.isGuardian}
Is BBC: ${data.isBBC}

`;
        
        if (data.isGuardian) {
          output += 'GUARDIAN SELECTORS:\n';
          Object.entries(data.guardianTests).forEach(([name, test]) => {
            output += `  ${name}: ${test.found ? '✅' : '❌'} ${test.text || ''}\n`;
          });
        }
        
        if (data.isBBC) {
          output += 'BBC SELECTORS:\n';
          Object.entries(data.bbcTests).forEach(([name, test]) => {
            output += `  ${name}: ${test.found ? '✅' : '❌'} ${test.text || ''}\n`;
          });
        }
        
        if (!data.isGuardian && !data.isBBC) {
          output += 'Not a Guardian or BBC site - selectors not tested';
        }
        
        resultEl.innerHTML = output;
        resultEl.className = 'test-result status-info';
      } else {
        throw new Error('Selector test failed');
      }
      
    } catch (error) {
      console.error('💥 Selector test failed:', error);
      resultEl.innerHTML = `❌ SELECTOR TEST FAILED
Error: ${error.message}`;
      resultEl.className = 'test-result status-fail';
    }
  }
  
  displayError(testId, message) {
    const resultEl = document.getElementById(testId);
    if (resultEl) {
      resultEl.innerHTML = `❌ ERROR: ${message}`;
      resultEl.className = 'test-result status-fail';
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎬 DOM loaded, initializing diagnostic tool...');
  new DiagnosticTool();
});