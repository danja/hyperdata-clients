# Rate Limiting Implementations for AI Client Library

To help you avoid hitting API rate limits when using the AI Client Library, I've created three different rate limiting implementations, each suited for different use cases:

## 1. Basic Rate-Limited Client

A simple queue-based implementation that spaces requests evenly to stay within a requests-per-minute limit. Ideal for basic applications with moderate throughput needs.

## 2. Advanced Rate Limiter (Token Bucket)

A more sophisticated implementation using the token bucket algorithm, which allows for burst capacity while maintaining average rate limits. Includes provider-specific defaults and customization options.

## 3. Rate-Limited Batch Processor

A specialized utility for processing large batches of requests with features like concurrency control, automatic retries with exponential backoff, and progress tracking.

Choose the implementation that best fits your needs based on your application's complexity and throughput requirements.
