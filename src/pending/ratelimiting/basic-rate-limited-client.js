/**
 * RateLimitedClient - A wrapper for AI clients that implements rate limiting
 * 
 * This class wraps any AI client created through the factory and enforces
 * a maximum number of requests per minute to avoid hitting API rate limits.
 */
class RateLimitedClient {
  /**
   * Create a new rate-limited client
   * @param {string} provider - The AI provider name (e.g., 'openai', 'claude')
   * @param {object} config - Configuration options for the provider
   * @param {number} requestsPerMinute - Maximum number of requests per minute
   */
  constructor(provider, config, requestsPerMinute = 60) {
    this.client = null;
    this.provider = provider;
    this.config = config;
    this.queue = [];
    this.processing = false;
    this.interval = 60000 / requestsPerMinute; // ms between requests
    this.lastRequestTime = 0;
  }

  /**
   * Initialize the client by creating the wrapped API client
   * @returns {RateLimitedClient} The initialized client instance
   */
  async initialize() {
    // Import is done here to allow for proper module loading in different environments
    const { createAPIClient } = await import('hyperdata-clients');
    this.client = await createAPIClient(this.provider, this.config);
    return this;
  }

  /**
   * Send a rate-limited chat completion request
   * @param {Array} messages - Array of message objects
   * @param {object} options - Provider-specific options
   * @returns {Promise<string>} The response text
   */
  async chat(messages, options = {}) {
    return this._enqueue('chat', [messages, options]);
  }

  /**
   * Send a rate-limited completion request
   * @param {string} prompt - The prompt text
   * @param {object} options - Provider-specific options
   * @returns {Promise<string>} The completion text
   */
  async complete(prompt, options = {}) {
    return this._enqueue('complete', [prompt, options]);
  }

  /**
   * Generate rate-limited embeddings
   * @param {string|Array} text - Text or array of texts to embed
   * @param {object} options - Provider-specific options
   * @returns {Promise<Array>} The embedding vectors
   */
  async embedding(text, options = {}) {
    return this._enqueue('embedding', [text, options]);
  }

  /**
   * Send a rate-limited streaming request
   * @param {Array} messages - Array of message objects
   * @param {Function} callback - Callback for each chunk
   * @param {object} options - Provider-specific options
   * @returns {Promise<void>} Resolves when streaming completes
   */
  async stream(messages, callback, options = {}) {
    return this._enqueue('stream', [messages, callback, options]);
  }

  /**
   * Add a request to the queue and process it when ready
   * @private
   * @param {string} method - Method name to call on the client
   * @param {Array} args - Arguments for the method
   * @returns {Promise} Resolves with the method result
   */
  async _enqueue(method, args) {
    return new Promise((resolve, reject) => {
      this.queue.push({ method, args, resolve, reject });
      this._processQueue();
    });
  }

  /**
   * Process the queue of requests, respecting the rate limit
   * @private
   */
  async _processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      
      // Wait if we need to respect the rate limit
      if (elapsed < this.interval) {
        await new Promise(r => setTimeout(r, this.interval - elapsed));
      }
      
      const { method, args, resolve, reject } = this.queue.shift();
      
      try {
        const result = await this.client[method](...args);
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      this.lastRequestTime = Date.now();
    }
    
    this.processing = false;
  }
}

// Example usage
async function example() {
  // Create and initialize the rate-limited client
  const client = await new RateLimitedClient(
    'openai', 
    { apiKey: process.env.OPENAI_API_KEY },
    30  // 30 requests per minute
  ).initialize();

  // Use as normal - requests will be rate-limited
  const response = await client.chat([
    { role: 'user', content: 'Hello' }
  ]);
  
  console.log(response);
}

export default RateLimitedClient;
