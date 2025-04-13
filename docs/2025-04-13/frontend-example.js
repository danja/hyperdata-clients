// client.js - Example frontend code using the API endpoints
// Import necessary libraries (if using a bundler like webpack)
// import axios from 'axios';

class AIClientInterface {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
    this.providers = [];
    this.selectedProvider = null;
  }

  // Initialize by fetching available providers
  async initialize() {
    try {
      const response = await fetch(`${this.baseUrl}/providers`);
      const data = await response.json();
      this.providers = data.providers || [];
      
      if (this.providers.length > 0) {
        this.selectedProvider = this.providers[0];
      }
      
      return this.providers;
    } catch (error) {
      console.error('Failed to initialize AI client:', error);
      throw error;
    }
  }

  // Set the active provider
  setProvider(provider) {
    if (this.providers.includes(provider)) {
      this.selectedProvider = provider;
      return true;
    }
    return false;
  }

  // Get chat completion
  async chat(messages, options = {}) {
    if (!this.selectedProvider) {
      throw new Error('No provider selected. Call initialize() first.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: this.selectedProvider,
          messages,
          options
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get chat response');
      }
      
      return data.response;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  // Get embeddings
  async getEmbeddings(text, options = {}) {
    if (!this.selectedProvider) {
      throw new Error('No provider selected. Call initialize() first.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: this.selectedProvider,
          text,
          options
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get embeddings');
      }
      
      return data.embedding;
    } catch (error) {
      console.error('Embeddings error:', error);
      throw error;
    }
  }

  // Stream chat completion
  async streamChat(messages, onChunk, onDone, onError, options = {}) {
    if (!this.selectedProvider) {
      throw new Error('No provider selected. Call initialize() first.');
    }

    try {
      const eventSource = new EventSource(`${this.baseUrl}/stream`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.error) {
          if (onError) onError(data.error);
          eventSource.close();
          return;
        }
        
        if (data.done) {
          if (onDone) onDone();
          eventSource.close();
          return;
        }
        
        if (data.chunk && onChunk) {
          onChunk(data.chunk);
        }
      };
      
      eventSource.onerror = (error) => {
        if (onError) onError(error);
        eventSource.close();
      };
      
      // Need to send the data to the server
      fetch(`${this.baseUrl}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: this.selectedProvider,
          messages,
          options
        })
      });
      
      // Return the EventSource so caller can close it if needed
      return eventSource;
    } catch (error) {
      console.error('Stream error:', error);
      if (onError) onError(error);
      throw error;
    }
  }
}

// Example usage
async function demo() {
  const client = new AIClientInterface();
  
  try {
    // Initialize and get available providers
    const providers = await client.initialize();
    console.log('Available providers:', providers);
    
    // Set preferred provider
    if (providers.includes('mistral')) {
      client.setProvider('mistral');
    }
    
    // Regular chat
    const response = await client.chat([
      { role: 'user', content: 'Hello, how are you?' }
    ]);
    console.log('Response:', response);
    
    // Streaming chat
    const outputElement = document.getElementById('output');
    if (outputElement) {
      client.streamChat(
        [{ role: 'user', content: 'Write a short poem about AI' }],
        (chunk) => {
          // Handle each chunk
          outputElement.textContent += chunk;
        },
        () => {
          // On completion
          console.log('Stream completed');
        },
        (error) => {
          // On error
          console.error('Stream error:', error);
        }
      );
    }
    
  } catch (error) {
    console.error('Demo error:', error);
  }
}

// Expose to global scope if not using modules
window.AIClientInterface = AIClientInterface;
window.runDemo = demo;

// Export if using modules
export default AIClientInterface;
