const axios = require('axios');

/**
 * Simple Twitter posting service for Voices articles
 * Posts to Twitter/X when articles are published
 */
class TwitterService {
  constructor() {
    this.enabled = process.env.TWITTER_ENABLED === 'true';
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;
  }

  async postArticle(article) {
    if (!this.enabled) {
      console.log('Twitter posting disabled');
      return { success: false, reason: 'disabled' };
    }

    if (!this.bearerToken) {
      console.error('Twitter Bearer Token not configured');
      return { success: false, reason: 'not_configured' };
    }

    try {
      const tweetText = this.generateTweet(article);

      console.log('📱 Posting to Twitter/X:', article.title);

      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        { text: tweetText },
        {
          headers: {
            'Authorization': `Bearer ${this.bearerToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

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
    return this.enabled && !!this.bearerToken;
  }
}

module.exports = new TwitterService();
