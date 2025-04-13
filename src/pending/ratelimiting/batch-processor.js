/**
 * BatchProcessor - Process batches of AI requests with rate limiting
 * 
 * This utility helps process large numbers of requests efficiently while
 * respecting API rate limits, with features like:
 * - Concurrent request limits
 * - Rate limiting with backoff
 * - Automatic retries
 * - Progress tracking
 */

/**
 * Configuration for the batch processor
 * @typedef {Object} BatchConfig
 * @property {number} [concurrency=3] - Maximum concurrent requests
 * @property {number} [requestsPerMinute=40] - Maximum requests per minute
 * @property {number} [maxRetries=3] - Maximum retry attempts for failed requests
 * @property {number} [retryDelayMs=1000] - Base delay between retries (increases with backoff)
 * @property {function} [onProgress] - Callback for progress updates
 * @property {boolean} [abortOnError=false] - Whether to abort all processing on error
 */

class BatchProcessor {
  /**
   * Create a new batch processor
   * @param {string} provider - The AI provider name
   * @param {object} clientConfig - Configuration for the AI client
   * @param {BatchConfig} batchConfig - Configuration for batch processing
   */
  constructor(provider, clientConfig, batchConfig = {}) {
    this.provider = provider;
    this.clientConfig = clientConfig;
    
    // Set configuration with defaults
    this.config = {
      concurrency: batchConfig.concurrency || 3,
      requestsPerMinute: batchConfig.requestsPerMinute || 40,
      maxRetries: batchConfig.maxRetries || 3,
      retryDelayMs: batchConfig.retryDelayMs || 1000,
      onProgress: batchConfig.onProgress || (() => {}),
      abortOnError: batchConfig.abortOnError || false
    };
    
    this.client = null;
    this.rateLimiter = null;
    this.activePromises = 0;
    this.requestQueue = [];
    this.isProcessing = false;
    this.aborted = false;
    
    // Stats tracking
    this.stats = {
      total: 0,
      completed: 0,
      failed: 0,
      retried: 0,
      startTime: null,
      endTime: null
    };
  }
  
  /**
   * Initialize the batch processor
   * @returns {BatchProcessor} The initialized batch processor
   */
  async initialize() {
    // Import dynamically to support different module systems
    const { createAPIClient } = await import('hyperdata-clients');
    const { SmartRateLimiter } = await import('./smart-rate-limiter.js');
    
    this.client = await createAPIClient(this.provider, this.clientConfig);
    this.rateLimiter = new SmartRateLimiter(this.provider, {
      rpm: this.config.requestsPerMinute
    });
    
    return this;
  }
  
  /**
   * Add a batch of requests for processing
   * @param {Array} requests - Array of request objects
   * @returns {Promise<Array>} Promise resolving to array of results
   */
  async processBatch(requests) {
    if (!this.client) {
      throw new Error('BatchProcessor not initialized. Call initialize() first.');
    }
    
    this.stats.total += requests.length;
    this.stats.startTime = this.stats.startTime || Date.now();
    
    // Create result array with same length as requests array
    const results = new Array(requests.length).fill(null);
    const promises = [];
    
    // Create a promise for each request
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      const promise = this._createRequestPromise(request, i, results);
      this.requestQueue.push({ promise, index: i });
    }
    
    // Start processing the queue
    this._processQueue();
    
    // Wait for all requests to complete
    await Promise.all(this.requestQueue.map(item => item.promise));
    
    this.stats.endTime = Date.now();
    return results;
  }
  
  /**
   * Abort any pending requests
   */
  abort() {
    this.aborted = true;
    this.requestQueue = [];
  }
  
  /**
   * Get processing statistics
   * @returns {object} Processing statistics
   */
  getStats() {
    const now = Date.now();
    const duration = (this.stats.endTime || now) - (this.stats.startTime || now);
    
    return {
      ...this.stats,
      duration,
      requestsPerSecond: this.stats.completed / (duration / 1000),
      successRate: this.stats.completed / Math.max(1, this.stats.total)
    };
  }
  
  /**
   * Create a promise to handle a single request with retries
   * @private
   */
  async _createRequestPromise(request, index, resultsArray) {
    let retries = 0;
    
    while (retries <= this.config.maxRetries) {
      try {
        // Wait for a slot to be available and rate limit to allow
        await this._waitForSlot();
        
        if (this.aborted) {
          throw new Error('Processing aborted');
        }
        
        // Execute the appropriate method based on request type
        let result;
        switch (request.type) {
          case 'chat':
            result = await this.client.chat(request.messages, request.options);
            break;
          case 'complete':
            result = await this.client.complete(request.prompt, request.options);
            break;
          case 'embedding':
            result = await this.client.embedding(request.text, request.options);
            break;
          default:
            throw new Error(`Unknown request type: ${request.type}`);
        }
        
        // Store result and update stats
        resultsArray[index] = result;
        this.stats.completed++;
        
        // Report progress
        this.config.onProgress({
          completed: this.stats.completed,
          total: this.stats.total,
          index,
          result
        });
        
        // Request completed successfully
        this.activePromises--;
        this._processQueue();
        return result;
        
      } catch (error) {
        // Handle retry logic
        retries++;
        this.stats.retried++;
        
        if (retries > this.config.maxRetries) {
          // Max retries exceeded, mark as failed
          this.stats.failed++;
          this.activePromises--;
          
          // Report error
          this.config.onProgress({
            completed: this.stats.completed,
            total: this.stats.total,
            index,
            error
          });
          
          if (this.config.abortOnError) {
            this.abort();
          }
          
          this._processQueue();
          throw error;
        }
        
        // Exponential backoff for retries
        const delay = this.config.retryDelayMs * Math.pow(2, retries - 1);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  
  /**
   * Wait for a slot to be available and rate limit to allow
   * @private
   */
  async _waitForSlot() {
    // Wait until we're below concurrency limit
    while (this.activePromises >= this.config.concurrency) {
      await new Promise(r => setTimeout(r, 100));
      if (this.aborted) return;
    }
    
    // Acquire rate limit permission
    await this.rateLimiter.acquire();
    this.activePromises++;
  }
  
  /**
   * Process the next items in the queue
   * @private
   */
  _processQueue() {
    if (this.isProcessing || this.aborted) return;
    this.isProcessing = true;
    
    // Process as many items as concurrency allows
    while (this.requestQueue.length > 0 && this.activePromises < this.config.concurrency) {
      const { promise } = this.requestQueue.shift();
      // The promise will handle itself, we just need to start it
      promise.catch(err => {
        // Catch here to prevent unhandled promise rejection
        // Actual error handling is in _createRequestPromise
      });
    }
    
    this.isProcessing = false;
  }
}

// Example usage
async function example() {
  // Create and initialize batch processor
  const batchProcessor = await new BatchProcessor(
    'openai',
    { apiKey: process.env.OPENAI_API_KEY },
    {
      concurrency: 3,
      requestsPerMinute: 30,
      onProgress: (progress) => {
        console.log(`Completed ${progress.completed}/${progress.total}`);
      }
    }
  ).initialize();
  
  // Create a batch of requests
  const requests = [
    {
      type: 'chat',
      messages: [{ role: 'user', content: 'Hello 1' }],
      options: { model: 'gpt-3.5-turbo' }
    },
    {
      type: 'chat',
      messages: [{ role: 'user', content: 'Hello 2' }],
      options: { model: 'gpt-3.5-turbo' }
    },
    {
      type: 'embedding',
      text: 'Sample text for embedding',
      options: { model: 'text-embedding-3-small' }
    }
  ];
  
  // Process all requests
  const results = await batchProcessor.processBatch(requests);
  
  // Get processing statistics
  console.log('Batch processing stats:', batchProcessor.getStats());
}

export default BatchProcessor;
