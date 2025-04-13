# Rate Limiting Implementation Guide

The hyperdata-clients library includes several rate limiting implementations that can help prevent hitting API rate limits and optimize your usage of AI services.

## Rate Limiting Overview

The library contains three rate limiting implementations in the `src/pending/ratelimiting/` directory:

1. **Basic Rate Limiter**: Simple queue-based implementation
2. **Advanced Rate Limiter**: Token bucket algorithm with burst capacity
3. **Batch Processor**: Handles large batches of requests with concurrency control

## Basic Rate-Limited Client

For simple applications with moderate throughput needs:

```javascript
import RateLimitedClient from 'hyperdata-clients/src/pending/ratelimiting/basic-rate-limited-client.js';

// Create and initialize rate-limited client with 30 requests per minute
const client = await new RateLimitedClient(
  'openai',
  { apiKey: process.env.OPENAI_API_KEY },
  30  // Requests per minute
).initialize();

// Use as normal - requests will be automatically rate-limited
const response = await client.chat([
  { role: 'user', content: 'Hello' }
]);
```

## Advanced Rate Limiter

For applications requiring better throughput with burst capacity:

```javascript
import { AdvancedRateLimitedClient } from 'hyperdata-clients/src/pending/ratelimiting/advanced-rate-limiter.js';

// Create rate-limited client with custom limits
const client = await new AdvancedRateLimitedClient(
  'openai',
  { apiKey: process.env.OPENAI_API_KEY },
  { rpm: 40, burst: 3 } // Override default rate limits
).initialize();

// Process multiple requests - they will be rate-limited automatically
const responses = await Promise.all([
  client.chat([{ role: 'user', content: 'Question 1' }]),
  client.chat([{ role: 'user', content: 'Question 2' }]),
  client.chat([{ role: 'user', content: 'Question 3' }])
]);

// Get statistics about how rate limiting affected requests
console.log('Rate limit stats:', client.getRateLimitStats());
```

## Batch Processor

For processing large numbers of requests efficiently:

```javascript
import BatchProcessor from 'hyperdata-clients/src/pending/ratelimiting/batch-processor.js';

// Create and initialize batch processor with concurrency and rate limits
const batchProcessor = await new BatchProcessor(
  'openai',
  { apiKey: process.env.OPENAI_API_KEY },
  {
    concurrency: 3,         // Max concurrent requests
    requestsPerMinute: 30,  // Rate limit
    maxRetries: 3,          // Auto-retry on failure
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

// Process all requests with automatic rate limiting and retries
const results = await batchProcessor.processBatch(requests);

// Get processing statistics
console.log('Batch processing stats:', batchProcessor.getStats());
```

## Default Rate Limits

The advanced rate limiter includes these default limits:

| Provider | Requests per Minute | Burst Capacity |
|----------|---------------------|----------------|
| OpenAI | 60 | 5 |
| Claude | 45 | 3 |
| Mistral | 40 | 3 |
| Ollama | 120 | 10 |
| Groq | 50 | 4 |
| Perplexity | 30 | 2 |
| HuggingFace | 20 | 2 |

## Best Practices

1. **Choose the Right Implementation**:
   - Use Basic Rate Limiter for simple needs
   - Use Advanced Rate Limiter for better throughput
   - Use Batch Processor for large batches of requests

2. **Adjust Limits Based on Your Plan**:
   - Free tiers typically have stricter rate limits
   - Paid plans may allow higher throughput
   - Check provider documentation for current limits

3. **Monitor Rate Limit Statistics**:
   - Use the `getRateLimitStats()` or `getStats()` methods
   - Track wait times and adjust limits accordingly

4. **Handle Rate Limit Errors**:
   - Implement exponential backoff for retries
   - Consider circuit breakers for persistent issues
