# Getting Started with hyperdata-clients

## Introduction

Welcome to hyperdata-clients, a unified client library for multiple AI providers. This tutorial will guide you through the basics of using this library to interact with various AI services.

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- API keys for the AI providers you want to use

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/danja/hyperdata-clients.git
   cd hyperdata-clients
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the project root and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_key
   MISTRAL_API_KEY=your_mistral_key
   # Add other API keys as needed
   ```

## Basic Usage

### Using the Minimal Example

The `minimal.js` example provides a simple command-line interface to test different AI providers:

```sh
# Basic usage
node examples/minimal.js ollama "Your prompt here"

# Specify a model
node examples/minimal.js openai "Your prompt here" --model gpt-4
```

### Using in Your Code

1. Import the library and configure your client:

```javascript
import dotenv from 'dotenv';
import ClientFactory from './src/common/ClientFactory.js';

// Load environment variables
dotenv.config();

// Create a client for your preferred provider
const client = ClientFactory.createClient('openai', {
  // Optional configuration
  model: 'gpt-4',
  temperature: 0.7
});
```

2. Make a simple completion request:

```javascript
async function getCompletion(prompt) {
  try {
    const response = await client.complete({
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

getCompletion('Tell me a joke');
```

## Available Providers

The library supports multiple AI providers. Here's how to use some of them:

### OpenAI

```javascript
const openai = ClientFactory.createClient('openai', {
  model: 'gpt-4',
  temperature: 0.7
});
```

### Mistral

```javascript
const mistral = ClientFactory.createClient('mistral', {
  model: 'mistral-medium',
  temperature: 0.8
});
```

### Ollama

```javascript
const ollama = ClientFactory.createClient('ollama', {
  model: 'llama2',
  baseUrl: 'http://localhost:11434'  // Default Ollama URL
});
```

## Advanced Usage

### Streaming Responses

Some providers support streaming responses:

```javascript
const stream = await client.complete({
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## Next Steps

- Explore the `examples/` directory for more usage examples
- Check out the API documentation by running `npm run docs`
- Refer to the source code for detailed implementation details

## Troubleshooting

- Make sure your API keys are set in the `.env` file
- Check your internet connection if you're experiencing timeouts
- Verify that the model name is correct for your chosen provider
- Enable debug logging by setting `DEBUG=hyperdata-clients*` in your environment variables
