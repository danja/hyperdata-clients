# Getting Started with hyperdata-clients

This guide will help you quickly integrate the hyperdata-clients library into your project.

## Installation

Install the library from GitHub:

```bash
npm install github:danja/hyperdata-clients
```

## Environment Setup

Create a `.env` file in your project root:

```
OPENAI_API_KEY=your_openai_key
CLAUDE_API_KEY=your_claude_key
MISTRAL_API_KEY=your_mistral_key
OLLAMA_HOST=http://localhost:11434
```

## Basic Usage

Here's how to create an AI client and start using it:

```javascript
import dotenv from 'dotenv';
import ClientFactory from 'hyperdata-clients/src/common/ClientFactory.js';

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    // Create a client for your preferred provider
    const client = await ClientFactory.createAPIClient('mistral', {
      apiKey: process.env.MISTRAL_API_KEY,
      model: 'mistral-medium' // Optional: specify model
    });
    
    // Send a chat message
    const response = await client.chat([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What are the key features of JavaScript?' }
    ]);
    
    console.log('Response:', response);
    
    // Generate embeddings
    const embedding = await client.embedding('What are the key features of JavaScript?');
    console.log('Embedding (first 5 values):', embedding.slice(0, 5));
    
    // Stream a response
    console.log('\nStreaming response:');
    await client.stream(
      [{ role: 'user', content: 'List 3 benefits of AI' }],
      chunk => process.stdout.write(chunk)
    );
    
    console.log('\n');
  } catch (error) {
    console.error('Error:', error);
    if (error.provider) {
      console.error(`Provider: ${error.provider}, Code: ${error.code}`);
    }
  }
}

// Run the example
main();
```

## Working with Multiple Providers

Create clients for different providers and use them based on your needs:

```javascript
// Create clients for different providers
const mistralClient = await ClientFactory.createAPIClient('mistral', {
  apiKey: process.env.MISTRAL_API_KEY
});

const openaiClient = await ClientFactory.createAPIClient('openai', {
  apiKey: process.env.OPENAI_API_KEY
});

const ollamaClient = await ClientFactory.createAPIClient('ollama', {
  baseUrl: process.env.OLLAMA_HOST || 'http://localhost:11434',
  model: 'llama2'
});

// Use different clients based on the task
const quickResponse = await mistralClient.chat([
  { role: 'user', content: 'Give me a quick fact about Mars.' }
]);

const detailedResponse = await openaiClient.chat([
  { role: 'user', content: 'Explain quantum computing in detail.' }
], { model: 'gpt-4' });

const localResponse = await ollamaClient.chat([
  { role: 'user', content: 'Suggest a recipe for dinner.' }
]);
```

## Next Steps

Now that you have the basic setup working, explore:

1. [API Reference](api-reference.md) - Complete reference of all classes and methods
2. [Integration Guide](integration-guide.md) - Deep dive into integration patterns
3. [Rate Limiting Guide](rate-limiting-guide.md) - How to implement rate limiting
4. [Security Considerations](security-considerations.md) - Best practices for secure usage