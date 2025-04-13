// app.js - Example of integrating hyperdata-clients into an Express application
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import ClientFactory from 'hyperdata-clients/src/common/ClientFactory.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());
app.use(cors());

// Initialize API clients for different providers
const clients = {};

async function initializeClients() {
  try {
    // Initialize OpenAI client
    if (process.env.OPENAI_API_KEY) {
      clients.openai = await ClientFactory.createAPIClient('openai', {
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    
    // Initialize Claude client
    if (process.env.CLAUDE_API_KEY) {
      clients.claude = await ClientFactory.createAPIClient('claude', {
        apiKey: process.env.CLAUDE_API_KEY
      });
    }
    
    // Initialize Mistral client
    if (process.env.MISTRAL_API_KEY) {
      clients.mistral = await ClientFactory.createAPIClient('mistral', {
        apiKey: process.env.MISTRAL_API_KEY,
        model: 'mistral-large-latest'
      });
    }
    
    // Initialize Ollama client (doesn't require API key for local deployment)
    clients.ollama = await ClientFactory.createAPIClient('ollama', {
      baseUrl: process.env.OLLAMA_HOST || 'http://localhost:11434',
      model: 'llama2'
    });
    
    console.log('API clients initialized:', Object.keys(clients).join(', '));
  } catch (error) {
    console.error('Error initializing clients:', error);
  }
}

// API endpoint to get available providers
app.get('/api/providers', (req, res) => {
  res.json({ providers: Object.keys(clients) });
});

// API endpoint for chat completion
app.post('/api/chat', async (req, res) => {
  const { provider, messages, options } = req.body;
  
  if (!provider || !clients[provider]) {
    return res.status(400).json({ error: `Invalid provider. Available: ${Object.keys(clients).join(', ')}` });
  }
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages must be an array' });
  }
  
  try {
    const response = await clients[provider].chat(messages, options || {});
    res.json({ response });
  } catch (error) {
    console.error(`Error with ${provider}:`, error);
    res.status(500).json({ 
      error: error.message,
      provider: error.provider,
      code: error.code
    });
  }
});

// API endpoint for embeddings
app.post('/api/embeddings', async (req, res) => {
  const { provider, text, options } = req.body;
  
  if (!provider || !clients[provider]) {
    return res.status(400).json({ error: `Invalid provider. Available: ${Object.keys(clients).join(', ')}` });
  }
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  try {
    // Check if provider supports embeddings
    if (!clients[provider].embedding) {
      return res.status(400).json({ error: `Provider ${provider} does not support embeddings` });
    }
    
    const embedding = await clients[provider].embedding(text, options || {});
    res.json({ embedding });
  } catch (error) {
    console.error(`Error with ${provider}:`, error);
    res.status(500).json({ 
      error: error.message,
      provider: error.provider,
      code: error.code
    });
  }
});

// API endpoint for streaming
app.post('/api/stream', async (req, res) => {
  const { provider, messages, options } = req.body;
  
  if (!provider || !clients[provider]) {
    return res.status(400).json({ error: `Invalid provider. Available: ${Object.keys(clients).join(', ')}` });
  }
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages must be an array' });
  }
  
  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  try {
    await clients[provider].stream(
      messages,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
      options || {}
    );
    
    // End the stream
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error(`Error streaming with ${provider}:`, error);
    res.write(`data: ${JSON.stringify({ 
      error: error.message,
      provider: error.provider,
      code: error.code 
    })}\n\n`);
    res.end();
  }
});

// Initialize and start server
const PORT = process.env.PORT || 3000;

initializeClients().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;
