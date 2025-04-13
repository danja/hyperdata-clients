/**
 * SmartRateLimiter - Advanced rate limiting using the token bucket algorithm
 * 
 * This implementation provides more sophisticated rate limiting with burst capacity,
 * which offers better throughput while still respecting API limits.
 */

// Provider-specific rate limits (requests per minute and burst capacity)
const PROVIDER_LIMITS = {
  'openai': { rpm: 60, burst: 5 },    // 60 requests per minute with 5 burst capacity
  'claude': { rpm: 45, burst: 3 },    // 45 requests per minute with 3 burst capacity
  'mistral': { rpm: 40, burst: 3 },   // 40 requests per minute with 3 burst capacity
  'ollama': { rpm: 120, burst: 10 },  // 120 requests per minute with 10 burst capacity
  'groq': { rpm: 50, burst: 4 },      // 50 requests per minute with 4 burst capacity
  'perplexity': { rpm: 30, burst: 2 },// 30 requests per minute with 2 burst capacity
  'huggingface': { rpm: 20, burst: 2 }// 20 requests per minute with 2 burst capacity
};

/**
 * Token bucket rate limiter that enforces provider-specific rate limits
 */
class SmartRateLimiter {
  /**
   * Create a new rate limiter for the specified provider
   * @param {string} provider - The AI provider name
   * @param {object} config - Optional configuration to override defaults
   */
  constructor(provider, config = {}) {
    this.provider = provider.toLowerCase();
    // Use configured limits or fall back to provider defaults or global default
    const defaultLimits = PROVIDER_LIMITS[this.provider] || { rpm: 20, burst: 2 };
    this.limits = {
      rpm: config.rpm || defaultLimits.rpm,
      burst: config.burst || defaultLimits.burst
    };
    
    // Initialize the token bucket with full capacity
    this.tokenBucket = this.limits.burst;
    this.lastRefill = Date.now();
    // Calculate tokens added per second
    this.refillRate = this.limits.rpm / 60;
    
    // Statistics tracking
    this.stats = {
      totalRequests: 0,
      waitedRequests: 0,
      totalWaitTimeMs: 0,
      maxWaitTimeMs: 0
    };
  }
  
  /**
   * Acquire permission to make a request, waiting if necessary
   * @returns {Promise<boolean>} Resolves to true when request can proceed
   */
  async acquire() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    
    // Refill the token bucket based on elapsed time
    this.tokenBucket = Math.min(
      this.limits.burst,
      this.tokenBucket + elapsedSeconds * this.refillRate
    );
    this.lastRefill = now;
    
    this.stats.totalRequests++;
    
    // If we don't have enough tokens, we need to wait
    if (this.tokenBucket < 1) {
      this.stats.waitedRequests++;
      
      // Calculate wait time until we have at least one token
      const waitTime = Math.ceil((1 - this.tokenBucket) / this.refillRate * 1000);
      
      this.stats.totalWaitTimeMs += waitTime;
      this.stats.maxWaitTimeMs = Math.max(this.stats.maxWaitTimeMs, waitTime);
      
      // Wait for the calculated time
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Try again after waiting
      return this.acquire();
    }
    
    // Consume one token
    this.tokenBucket -= 1;
    return true;
  }
  
  /**
   * Get statistics about rate limiting
   * @returns {object} Rate limiting statistics
   */
  getStats() {
    return {
      ...this.stats,
      provider: this.provider,
      limits: this.limits,
      waitRatio: this.stats.waitedRequests / Math.max(1, this.stats.totalRequests),
      avgWaitTimeMs: this.stats.totalWaitTimeMs / Math.max(1, this.stats.waitedRequests)
    };
  }
}

/**
 * Advanced rate-limited client using the token bucket algorithm
 */
class AdvancedRateLimitedClient {
  /**
   * Create a new advanced rate-limited client
   * @param {string} provider - The AI provider name
   * @param {object} config - Configuration for the AI client
   * @param {object} limitConfig - Rate limit configuration (optional)
   */
  constructor(provider, config, limitConfig = {}) {
    this.provider = provider;
    this.config = config;
    this.rateLimiter = new SmartRateLimiter(provider, limitConfig);
    this.client = null;
  }
  
  /**
   * Initialize the client
   * @returns {AdvancedRateLimitedClient} The initialized client
   */
  async initialize() {
    // Import dynamically to support different module systems
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
    await this.rateLimiter.acquire();
    return this.client.chat(messages, options);
  }
  
  /**
   * Send a rate-limited completion request
   * @param {string} prompt - The prompt text
   * @param {object} options - Provider-specific options
   * @returns {Promise<string>} The completion text
   */
  async complete(prompt, options = {}) {
    await this.rateLimiter.acquire();
    return this.client.complete(prompt, options);
  }
  
  /**
   * Generate rate-limited embeddings
   * @param {string|Array} text - Text to embed
   * @param {object} options - Provider-specific options
   * @returns {Promise<Array>} The embedding vectors
   */
  async embedding(text, options = {}) {
    await this.rateLimiter.acquire();
    return this.client.embedding(text, options);
  }
  
  /**
   * Send a rate-limited streaming request
   * @param {Array} messages - Array of message objects
   * @param {Function} callback - Callback for each chunk
   * @param {object} options - Provider-specific options
   * @returns {Promise<void>} Resolves when streaming completes
   */
  async stream(messages, callback, options = {}) {
    await this.rateLimiter.acquire();
    return this.client.stream(messages, callback, options);
  }
  
  /**
   * Get rate limiting statistics
   * @returns {object} Rate limiting statistics
   */
  getRateLimitStats() {
    return this.rateLimiter.getStats();
  }
}

// Example usage
async function example() {
  // Create a rate-limited client with custom limits
  const client = await new AdvancedRateLimitedClient(
    'openai',
    { apiKey: process.env.OPENAI_API_KEY },
    { rpm: 40, burst: 3 } // Override default rate limits
  ).initialize();
  
  // Process multiple requests - they will be rate-limited
  const responses = await Promise.all([
    client.chat([{ role: 'user', content: 'Question 1' }]),
    client.chat([{ role: 'user', content: 'Question 2' }]),
    client.chat([{ role: 'user', content: 'Question 3' }])
  ]);
  
  // Get statistics about how rate limiting affected requests
  console.log('Rate limit stats:', client.getRateLimitStats());
}

export { SmartRateLimiter, AdvancedRateLimitedClient };
