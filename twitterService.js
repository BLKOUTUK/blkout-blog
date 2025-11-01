const axios = require('axios');
const crypto = require('crypto');

/**
 * Simple Twitter posting service for Voices articles
 * Posts to Twitter/X when articles are published
 * Supports both Bearer Token and OAuth 1.0a (your existing API keys)
 */
class TwitterService {
  constructor() {
    this.enabled = process.env.TWITTER_ENABLED === 'true';

    // Bearer Token (v2 API - simpler, but you don't have this)
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;

    // OAuth 1.0a keys (v2 API - YOU HAVE THESE!)
    this.apiKey = process.env.TWITTER_API_KEY;
    this.apiSecret = process.env.TWITTER_API_SECRET;
    this.accessToken = process.env.TWITTER_ACCESS_TOKEN;
    this.accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
  }

  async postArticle(article) {
    if (!this.enabled) {
      console.log('Twitter posting disabled');
      return { success: false, reason: 'disabled' };
    }

    // Check which authentication method is available
    const hasOAuth = this.apiKey && this.apiSecret && this.accessToken && this.accessSecret;
    const hasBearerToken = !!this.bearerToken;

    if (!hasOAuth && !hasBearerToken) {
      console.error('Twitter API credentials not configured');
      return { success: false, reason: 'not_configured' };
    }

    try {
      const tweetText = this.generateTweet(article);

      console.log('📱 Posting to Twitter/X:', article.title);

      let response;

      if (hasOAuth) {
        // Use OAuth 1.0a with your existing API keys
        console.log('Using OAuth 1.0a authentication');
        response = await this.postWithOAuth(tweetText);
      } else {
        // Use Bearer Token
        console.log('Using Bearer Token authentication');
        response = await this.postWithBearerToken(tweetText);
      }

      const tweetId = response.data.data.id;
      const tweetUrl = `https://twitter.com/BLKOUTUK/status/${tweetId}`;

      console.log('✅ Posted to Twitter:', tweetUrl);

      return {
        success: true,
        tweetId,
        url: tweetUrl
      };

    } catch (error) {
      console.error('❌ Twitter posting failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  }

  async postWithBearerToken(tweetText) {
    return await axios.post(
      'https://api.twitter.com/2/tweets',
      { text: tweetText },
      {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  async postWithOAuth(tweetText) {
    const url = 'https://api.twitter.com/2/tweets';
    const method = 'POST';

    // Generate OAuth 1.0a signature
    const oauthHeaders = this.generateOAuthHeaders(method, url);

    return await axios.post(url, { text: tweetText }, {
      headers: {
        ...oauthHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  generateOAuthHeaders(method, url) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(32).toString('base64').replace(/\W/g, '');

    const parameters = {
      oauth_consumer_key: this.apiKey,
      oauth_token: this.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
      oauth_version: '1.0'
    };

    // Create signature base string
    const parameterString = Object.keys(parameters)
      .sort()
      .map(key => `${this.percentEncode(key)}=${this.percentEncode(parameters[key])}`)
      .join('&');

    const signatureBaseString = `${method}&${this.percentEncode(url)}&${this.percentEncode(parameterString)}`;

    // Create signing key
    const signingKey = `${this.percentEncode(this.apiSecret)}&${this.percentEncode(this.accessSecret)}`;

    // Generate signature
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(signatureBaseString)
      .digest('base64');

    parameters.oauth_signature = signature;

    // Build Authorization header
    const authHeader = 'OAuth ' + Object.keys(parameters)
      .sort()
      .map(key => `${this.percentEncode(key)}="${this.percentEncode(parameters[key])}"`)
      .join(', ');

    return {
      'Authorization': authHeader
    };
  }

  percentEncode(str) {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  }

  generateTweet(article) {
    const baseUrl = process.env.WEBSITE_URL || 'https://blkoutuk.com';
    const articleUrl = `${baseUrl}/voices/${article.slug}`;

    // Twitter counts URLs as 23 chars
    const urlLength = 23;
    const hashtags = this.selectHashtags(article);
    const hashtagString = hashtags.join(' ');

    // Calculate space for title
    const availableSpace = 280 - urlLength - hashtagString.length - 4; // spaces/newlines

    let title = article.title;
    if (title.length > availableSpace) {
      title = title.substring(0, availableSpace - 3) + '...';
    }

    return `${title}\n\n${articleUrl}\n\n${hashtagString}`.trim();
  }

  selectHashtags(article) {
    const coreHashtags = ['#BLKOUT', '#BlackQueer'];

    const categoryHashtags = {
      opinion: '#Opinion',
      community: '#Community',
      culture: '#BlackCulture',
      politics: '#LGBTQ',
      health: '#MentalHealth',
      arts: '#BlackArt',
      'lived-experience': '#LivedExperience'
    };

    const categoryTag = categoryHashtags[article.category];
    if (categoryTag) {
      return [...coreHashtags, categoryTag];
    }

    return coreHashtags;
  }

  isConfigured() {
    const hasOAuth = this.apiKey && this.apiSecret && this.accessToken && this.accessSecret;
    const hasBearerToken = !!this.bearerToken;
    return this.enabled && (hasOAuth || hasBearerToken);
  }
}

module.exports = new TwitterService();
