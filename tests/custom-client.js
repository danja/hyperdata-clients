// CustomAIClient.js - Example of extending hyperdata-clients with custom functionality
import ClientFactory from 'hyperdata-clients/src/common/ClientFactory.js';
import APIError from 'hyperdata-clients/src/common/APIError.js';

/**
 * Enhanced AI client with caching, retries, and provider fallback capabilities
 */
class CustomAIClient {
  /**
   * Create a new enhanced AI client
   * @param {Object} config - Configuration options
   * @param {Array<string>} config.providers - List of providers in fallback order
   * @param {Object} config.providerConfigs - Configuration for each provider
   * @param {boolean} config.enableCache - Whether to enable response caching
   * @param {number} config.maxRetries - Maximum retry attempts
   * @param {number} config.retryDelay - Delay between retries in ms
   */
  constructor(config = {}) {
    this.providers = config.providers || ['mistral', 'openai', 'ollama'];
    this.providerConfigs = config.providerConfigs || {};
    this.enableCache = config.enableCache || false;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.clients = {};
    this.cache = new Map();
  }

  /**
   * Initialize all configured providers
   * @returns {Promise<void>}
   */
  async initialize() {
    for (const provider of this.providers) {
      try {
        this.clients[provider] = await ClientFactory.createAPIClient(
          provider, 
          this.providerConfigs[provider] || {}
        );
        console.log(`Initialized ${provider} client`);
      } catch (error) {
        console.warn(`Failed to initialize ${provider} client:`, error.message);
      }
    }

    if (Object.keys(this.clients).length === 0) {
      throw new Error('Failed to initialize any AI clients');
    }
  }

  /**
   * Generate a cache key from messages and options
   * @private
   */
  _getCacheKey(messages, options = {}) {
    const messagesStr = JSON.stringify(messages);
    const optionsStr = JSON.stringify(options);
    return `${messagesStr}|${optionsStr}`;
  }

  /**
   * Execute a method with retry and fallback logic
   * @private
   */
  async _executeWithFallback(method, args, options = {}) {
    const [messages] = args;
    
    // Check cache if enabled
    if (this.enableCache && method === 'chat') {
      const cacheKey = this._getCacheKey(messages, options);
      if (this.cache.has(cacheKey)) {
        console.log('Cache hit!');
        return this.cache.get(cacheKey);
      }
    }

    // Try each provider with retries
    const errors = [];
    
    for (const provider of this.providers) {
      const client = this.clients[provider];
      if (!client) continue;
      
      // Skip if this provider doesn't support this method
      if (typeof client[method] !== 'function') {
        errors.push(new APIError(`Provider ${provider} does not support ${method}`, provider, 'METHOD_NOT_SUPPORTED'));
        continue;
      }

      // Try with retries
      let retries = 0;
      while (retries <= this.maxRetries) {
        try {
          console.log(`Attempting ${method} with ${provider} (attempt ${retries + 1})`);
          const result = await client[method](...args, options);
          
          // Cache successful chat results if enabled
          if (this.enableCache && method === 'chat') {
            const cacheKey = this._getCacheKey(messages, options);
            this.cache.set(cacheKey, result);
          }
          
          return result;
        } catch (error) {
          console.warn(`Error with ${provider} (attempt ${retries + 1}):`, error.message);
          errors.push(error);
          
          // If rate limited, wait longer before retry
          const isRateLimited = error.code === 429 || error.message.includes('rate limit');
          const delay = isRateLimited 
            ? this.retryDelay * Math.pow(2, retries) 
            : this.retryDelay;
          
          if (retries < this.maxRetries) {
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          retries++;
        }
      }
    }
    
    // If we get here, all providers failed
    const errorMessage = `All providers failed for ${method}: ${errors.map(e => e.message).join(', ')}`;
    throw new Error(errorMessage);
  }

  /**
   * Send a chat completion request with fallback and retry logic
   * @param {Array} messages - Array of message objects
   * @param {Object} options - Provider-specific options
   * @returns {Promise<string>} - The response text
   */
  async chat(messages, options = {}) {
    return this._executeWithFallback('chat', [messages], options);
  }

  /**
   * Send a text completion request with fallback and retry logic
   * @param {string} prompt - The prompt text
   * @param {Object} options - Provider-specific options
   * @returns {Promise<string>} - The completion text
   */
  async complete(prompt, options = {}) {
    return this._executeWithFallback('complete', [prompt], options);
  }

  /**
   * Generate embeddings with fallback and retry logic
   * @param {string|Array} text - Text to embed
   * @param {Object} options - Provider-specific options
   * @returns {Promise<Array>} - The embedding vectors
   */
  async embedding(text, options = {}) {
    return this._executeWithFallback('embedding', [text], options);
  }

  /**
   * Stream a response with fallback and retry logic
   * @param {Array} messages - Array of message objects
   * @param {Function} callback - Callback for each chunk
   * @param {Object} options - Provider-specific options
   * @returns {Promise<void>} - Resolves when streaming completes
   */
  async stream(messages, callback, options = {}) {
    return this._executeWithFallback('stream', [messages, callback], options);
  }
  
  /**
   * Clears the response cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }
  
  /**
   * Gets the size of the cache
   * @returns {number} Number of items in cache
   */
  getCacheSize() {
    return this.cache.size;
  }
}

// Usage example
async function example() {
  const client = new CustomAIClient({
    providers: ['mistral', 'openai', 'ollama'],
    providerConfigs: {
      mistral: {
        apiKey: process.env.MISTRAL_API_KEY,
        model: 'mistral-medium'
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4-turbo'
      },
      ollama: {
        model: 'llama2'
      }
    },
    enableCache: true,
    maxRetries: 2
  });
  
  await client.initialize();
  
  try {
    // Will try mistral first, then openai, then ollama
    const response = await client.chat([
      { role: 'user', content: 'Explain quantum computing in simple terms' }
    ]);
    
    console.log('Response:', response);
    
    // Second call with same input will use cache
    const cachedResponse = await client.chat([
      { role: 'user', content: 'Explain quantum computing in simple terms' }
    ]);
    
    console.log('Cache size:', client.getCacheSize());
  } catch (error) {
    console.error('All providers failed:', error);
  }
}

export default CustomAIClient;
