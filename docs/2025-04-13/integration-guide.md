# hyperdata-clients Integration Guide

This guide explains how to integrate and use the hyperdata-clients library in your projects to interact with multiple AI providers through a unified interface.

## Installation

To use hyperdata-clients in your project:

```bash
# Clone the repository
git clone https://github.com/danja/hyperdata-clients.git

# Install as a local dependency
npm install ./hyperdata-clients
```

Or add to your project's `package.json`:

```json
"dependencies": {
  "hyperdata-clients": "github:danja/hyperdata-clients"
}
```

## Quick Start

```javascript
import ClientFactory from 'hyperdata-clients/src/common/ClientFactory.js';

// Create a client for your preferred provider
const client = await ClientFactory.createAPIClient('mistral', { 
  apiKey: process.env.MISTRAL_API_KEY 
});

// Send a chat message
const response = await client.chat([
  { role: 'user', content: 'Hello, how are you?' }
]);

console.log(response);
```

## API Key Management

The library supports multiple ways to provide API keys:

1. **Environment Variables**: Set `PROVIDER_API_KEY` in your `.env` file
   - Example: `MISTRAL_API_KEY=your_key_here`

2. **Configuration Object**:
   ```javascript
   const client = await ClientFactory.createAPIClient('openai', {
     apiKey: 'your_key_here'
   });
   ```

3. **Key Rotation**:
   ```javascript
   import KeyManager from 'hyperdata-clients/src/common/KeyManager.js';
   KeyManager.rotateKey(config, 'openai', 'new_key_value');
   ```

## Supported Providers

| Provider | Class | Environment Variable | Default Model |
|----------|-------|----------------------|--------------|
| OpenAI | OpenAIClient | OPENAI_API_KEY | gpt-4-turbo-preview |
| Claude | Claude | CLAUDE_API_KEY | claude-3-opus-20240229 |
| Mistral | Mistral | MISTRAL_API_KEY | mistral-tiny |
| Ollama | Ollama | OLLAMA_API_KEY | qwen2:1.5b |
| Groq | Groqq | GROQ_API_KEY | llama3-8b-8192 |
| Perplexity | Perplexity | PERPLEXITY_API_KEY | pplx-7b-chat |
| HuggingFace | HuggingFace | HUGGINGFACE_API_KEY | gpt2 |

## Core Methods

All API clients implement these methods:

### `chat(messages, options)`

Send a chat completion request.

```javascript
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Tell me about JavaScript.' }
];

const response = await client.chat(messages, {
  model: 'specific-model-name', // Optional: override default model
  temperature: 0.7,             // Optional: control randomness
  maxTokens: 1000               // Optional: limit response length
});
```

### `complete(prompt, options)`

Send a text completion request (wrapper around chat in most implementations).

```javascript
const response = await client.complete('Explain what JavaScript is', {
  temperature: 0.5
});
```

### `embedding(text, options)`

Generate vector embeddings for text.

```javascript
const vector = await client.embedding('This is a sample text');
// Returns array of floating-point numbers
```

### `stream(messages, callback, options)`

Stream a response incrementally.

```javascript
await client.stream(
  [{ role: 'user', content: 'Write a poem about coding' }],
  (chunk) => {
    // Process each chunk as it arrives
    process.stdout.write(chunk);
  },
  { temperature: 0.8 }
);
```

## Error Handling

The library uses custom `APIError` class for consistent error handling across providers:

```javascript
try {
  const response = await client.chat([{ role: 'user', content: 'Hello' }]);
} catch (error) {
  if (error.name === 'APIError') {
    console.error(`${error.provider} API error (${error.code}): ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Advanced Usage: Provider-Specific Options

Each provider supports specific options that can be passed to API methods:

```javascript
// Claude-specific options
const claudeResponse = await claudeClient.chat(messages, {
  model: 'claude-3-sonnet-20240229',
  temperature: 0.7
});

// Ollama-specific options
const ollamaResponse = await ollamaClient.chat(messages, {
  model: 'llama2',
  parameters: {
    num_ctx: 4096
  }
});
```

## Integration Example

A complete example integrating the library into an Express application:

```javascript
import express from 'express';
import dotenv from 'dotenv';
import ClientFactory from 'hyperdata-clients/src/common/ClientFactory.js';

dotenv.config();

const app = express();
app.use(express.json());

// Create API client
const openaiClient = await ClientFactory.createAPIClient('openai', {
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await openaiClient.chat(messages);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Choosing the Right Provider

Consider these factors when selecting a provider:

- **Cost**: OpenAI, Claude, and Mistral have usage-based pricing
- **Performance**: Larger models (OpenAI GPT-4, Claude Opus) provide better quality but are slower
- **Latency**: Ollama (local) offers lowest latency but requires more system resources
- **Embeddings**: Only certain providers (OpenAI, Claude, Mistral) support embeddings

## Best Practices

1. **Environment Variable Management**:
   - Use dotenv for development
   - Use secure environment variables in production
   - Never hardcode API keys

2. **Error Handling**:
   - Always implement proper error handling for API calls
   - Consider implementing retry logic for transient errors

3. **Rate Limiting**:
   - Implement rate limiting to avoid API quota issues
   - See the pending rate limiting implementations in src/pending/ratelimiting/

4. **Streaming for Long Responses**:
   - Use streaming for long-form content generation
   - Improves user experience with incremental display
