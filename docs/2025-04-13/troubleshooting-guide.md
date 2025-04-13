# Troubleshooting Guide

This guide covers common issues you might encounter when integrating hyperdata-clients into your application.

## API Key Issues

### Invalid API Key Format

**Symptoms**: Error message about invalid API key format

**Solutions**:
- Check that your API key follows the correct format:
  - OpenAI: `sk-` prefix, e.g., `sk-1234567890abcdef`
  - Claude: `sk-ant-` prefix, e.g., `sk-ant-1234567890abcdef`
  - Mistral: 32+ character string
  - Groq: `gsk-` prefix
  - Perplexity: `pplx-` prefix
  - HuggingFace: `hf_` prefix

### API Key Not Found

**Symptoms**: Error like "API key is required"

**Solutions**:
- Verify your .env file exists and contains the correct variable:
  ```
  PROVIDER_API_KEY=your_key_here
  ```
- Make sure dotenv is configured properly:
  ```javascript
  import dotenv from 'dotenv';
  dotenv.config();
  ```
- Check file paths when using custom .env locations:
  ```javascript
  dotenv.config({ path: './config/.env' });
  ```

## Connection Issues

### Ollama Connection Failed

**Symptoms**: Error connecting to Ollama server

**Solutions**:
- Ensure Ollama is running: `ollama serve`
- Verify the correct host URL:
  ```javascript
  const client = await ClientFactory.createAPIClient('ollama', {
    baseUrl: 'http://localhost:11434'
  });
  ```
- Check if you can access the Ollama API directly:
  ```bash
  curl http://localhost:11434/api/version
  ```

### Network Timeouts

**Symptoms**: Requests timing out or taking very long

**Solutions**:
- Increase timeout in client options:
  ```javascript
  const client = await ClientFactory.createAPIClient('openai', {
    apiKey: process.env.OPENAI_API_KEY,
    clientOptions: {
      timeout: 60000  // 60 seconds
    }
  });
  ```
- Check your network connection
- Verify proxy settings if applicable

## Rate Limiting

### Too Many Requests

**Symptoms**: Error codes 429, "rate limit exceeded"

**Solutions**:
- Implement one of the rate limiters:
  ```javascript
  import RateLimitedClient from 'hyperdata-clients/src/pending/ratelimiting/basic-rate-limited-client.js';
  
  const client = await new RateLimitedClient(
    'openai',
    { apiKey: process.env.OPENAI_API_KEY },
    30  // 30 requests per minute
  ).initialize();
  ```
- Add exponential backoff for retries:
  ```javascript
  async function retryWithBackoff(fn, maxRetries = 3) {
    let retries = 0;
    while (retries <= maxRetries) {
      try {
        return await fn();
      } catch (error) {
        if (error.code !== 429 || retries === maxRetries) throw error;
        const delay = Math.pow(2, retries) * 1000;
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      }
    }
  }
  
  // Usage
  const response = await retryWithBackoff(() => 
    client.chat([{ role: 'user', content: 'Hello' }])
  );
  ```

## Model Errors

### Model Not Found

**Symptoms**: Error about model not found or unavailable

**Solutions**:
- Verify the model name is correct:
  ```javascript
  // For OpenAI
  client.chat(messages, { model: 'gpt-4-turbo' });  // Not 'gpt4' or 'gpt-4'
  
  // For Ollama, make sure model is pulled
  // Run: ollama pull llama2
  client.chat(messages, { model: 'llama2' });
  ```
- Check model availability for your account tier
- For Ollama, pull the model first: `ollama pull modelname`

### Input Too Long

**Symptoms**: Error about exceeding max token limit

**Solutions**:
- Reduce input length or split into smaller chunks
- Specify a model with larger context window
- Implement a text splitter:
  ```javascript
  function splitIntoChunks(text, maxChunkSize = 1000) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkSize) {
        currentChunk += sentence + ' ';
      } else {
        chunks.push(currentChunk.trim());
        currentChunk = sentence + ' ';
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
  ```

## Streaming Issues

### Streaming Not Working

**Symptoms**: No chunks received or only final response received

**Solutions**:
- Ensure you're using the stream method correctly:
  ```javascript
  await client.stream(
    messages,
    chunk => console.log(chunk),  // Called for each chunk
    options
  );
  ```
- Verify the provider supports streaming
- Check network configuration for streaming support

## Embedding Issues

### Embedding Not Supported

**Symptoms**: Error about embedding not supported

**Solutions**:
- Check if the provider supports embeddings
- Switch to a provider that supports embeddings:
  ```javascript
  const embeddingClient = await ClientFactory.createAPIClient('openai', {
    apiKey: process.env.OPENAI_API_KEY
  });
  const embedding = await embeddingClient.embedding('text to embed');
  ```

## Testing Issues

### Mocking APIs in Tests

**Solutions**:
- Use dependency injection and mocks:
  ```javascript
  // Create a mock client
  const mockClient = {
    chat: jest.fn().mockResolvedValue('Mock response'),
    embedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3])
  };
  
  // Inject it into your application code
  function myAIService(client) {
    return {
      getAnswer: async (question) => {
        return client.chat([{ role: 'user', content: question }]);
      }
    };
  }
  
  // Test
  test('getAnswer returns response from AI', async () => {
    const service = myAIService(mockClient);
    const response = await service.getAnswer('test question');
    expect(response).toBe('Mock response');
    expect(mockClient.chat).toHaveBeenCalledWith([
      { role: 'user', content: 'test question' }
    ]);
  });
  ```

## Debugging

### Enable Debug Logging

Add this to your application to get detailed logs:

```javascript
// Set DEBUG environment variable
process.env.DEBUG = 'hyperdata-clients:*';

// Or create a custom logger
const debugLog = (message) => {
  if (process.env.DEBUG) {
    console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`);
  }
};

// Use in code
debugLog('Creating client for provider: ' + provider);
```

### Verify Requests

Use a network inspector to verify requests:

```javascript
const axios = require('axios');
const originalRequest = axios.request;

axios.request = function(config) {
  console.log('Making request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data
  });
  return originalRequest.apply(this, arguments);
};
```

## Still Having Issues?

1. Check the GitHub repository for open issues
2. Create a minimal reproducible example
3. Verify your dependencies are up to date
