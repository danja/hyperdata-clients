// test-ai-client.js - Example of how to test an integration with hyperdata-clients
import { expect } from 'chai';
import sinon from 'sinon';
import ClientFactory from 'hyperdata-clients/src/common/ClientFactory.js';
import APIError from 'hyperdata-clients/src/common/APIError.js';
import CustomAIClient from '../src/CustomAIClient.js';

describe('CustomAIClient Integration Tests', () => {
  let client;
  let mockOpenAI;
  let mockMistral;
  let mockOllama;
  let createAPIClientStub;

  beforeEach(async () => {
    // Create mock clients
    mockOpenAI = {
      chat: sinon.stub(),
      complete: sinon.stub(),
      embedding: sinon.stub(),
      stream: sinon.stub()
    };
    
    mockMistral = {
      chat: sinon.stub(),
      complete: sinon.stub(),
      embedding: sinon.stub(),
      stream: sinon.stub()
    };
    
    mockOllama = {
      chat: sinon.stub(),
      complete: sinon.stub(),
      embedding: sinon.stub(),
      stream: sinon.stub()
    };
    
    // Stub the factory method
    createAPIClientStub = sinon.stub(ClientFactory, 'createAPIClient');
    createAPIClientStub.withArgs('openai', sinon.match.any).resolves(mockOpenAI);
    createAPIClientStub.withArgs('mistral', sinon.match.any).resolves(mockMistral);
    createAPIClientStub.withArgs('ollama', sinon.match.any).resolves(mockOllama);
    
    // Create the client under test
    client = new CustomAIClient({
      providers: ['mistral', 'openai', 'ollama'],
      providerConfigs: {
        mistral: { apiKey: 'test-mistral-key' },
        openai: { apiKey: 'test-openai-key' },
        ollama: { baseUrl: 'http://localhost:11434' }
      },
      enableCache: true
    });
    
    await client.initialize();
  });
  
  afterEach(() => {
    // Restore stubs
    createAPIClientStub.restore();
  });
  
  describe('Initialization', () => {
    it('should initialize clients for all providers', () => {
      expect(client.clients.mistral).to.equal(mockMistral);
      expect(client.clients.openai).to.equal(mockOpenAI);
      expect(client.clients.ollama).to.equal(mockOllama);
    });
    
    it('should handle initialization failures gracefully', async () => {
      createAPIClientStub.withArgs('mistral', sinon.match.any).rejects(new Error('Failed to init'));
      
      const clientWithFailure = new CustomAIClient({
        providers: ['mistral', 'openai'],
        providerConfigs: {
          mistral: { apiKey: 'invalid-key' },
          openai: { apiKey: 'test-key' }
        }
      });
      
      await clientWithFailure.initialize();
      expect(clientWithFailure.clients.mistral).to.be.undefined;
      expect(clientWithFailure.clients.openai).to.equal(mockOpenAI);
    });
  });
  
  describe('Fallback behavior', () => {
    it('should fall back to the next provider when primary fails', async () => {
      const testMessages = [{ role: 'user', content: 'test' }];
      
      // First provider fails
      mockMistral.chat.rejects(new APIError('Rate limit exceeded', 'mistral', 429));
      
      // Second provider succeeds
      mockOpenAI.chat.resolves('Response from OpenAI');
      
      const result = await client.chat(testMessages);
      expect(result).to.equal('Response from OpenAI');
      expect(mockMistral.chat.calledOnce).to.be.true;
      expect(mockOpenAI.chat.calledOnce).to.be.true;
      expect(mockOllama.chat.called).to.be.false;
    });
    
    it('should try all providers before giving up', async () => {
      const testMessages = [{ role: 'user', content: 'test' }];
      
      // All providers fail
      mockMistral.chat.rejects(new APIError('Rate limit', 'mistral', 429));
      mockOpenAI.chat.rejects(new APIError('Invalid key', 'openai', 401));
      mockOllama.chat.rejects(new APIError('Connection error', 'ollama', 500));
      
      try {
        await client.chat(testMessages);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('All providers failed');
        expect(mockMistral.chat.calledOnce).to.be.true;
        expect(mockOpenAI.chat.calledOnce).to.be.true;
        expect(mockOllama.chat.calledOnce).to.be.true;
      }
    });
  });
  
  describe('Retry behavior', () => {
    it('should retry failed requests before moving to next provider', async () => {
      const testMessages = [{ role: 'user', content: 'test' }];
      
      // First provider fails twice, then succeeds
      mockMistral.chat.onCall(0).rejects(new APIError('Rate limit', 'mistral', 429));
      mockMistral.chat.onCall(1).rejects(new APIError('Rate limit', 'mistral', 429));
      mockMistral.chat.onCall(2).resolves('Response after retries');
      
      const result = await client.chat(testMessages);
      expect(result).to.equal('Response after retries');
      expect(mockMistral.chat.calledThrice).to.be.true;
      expect(mockOpenAI.chat.called).to.be.false;
    });
  });
  
  describe('Caching', () => {
    it('should cache successful responses', async () => {
      const testMessages = [{ role: 'user', content: 'test cache' }];
      
      mockMistral.chat.resolves('Cached response');
      
      // First call - should use the API
      const firstResponse = await client.chat(testMessages);
      expect(firstResponse).to.equal('Cached response');
      expect(mockMistral.chat.calledOnce).to.be.true;
      
      // Second call with same input - should use cache
      const secondResponse = await client.chat(testMessages);
      expect(secondResponse).to.equal('Cached response');
      expect(mockMistral.chat.calledOnce).to.be.true; // Still only called once
      
      // Verify cache size
      expect(client.getCacheSize()).to.equal(1);
    });
    
    it('should respect different options when caching', async () => {
      const testMessages = [{ role: 'user', content: 'test options' }];
      
      mockMistral.chat.resolves('Response with default options');
      
      // First call with default options
      await client.chat(testMessages);
      
      // Second call with different options - should not use cache
      mockMistral.chat.resolves('Response with custom options');
      const response = await client.chat(testMessages, { temperature: 0.9 });
      
      expect(response).to.equal('Response with custom options');
      expect(mockMistral.chat.calledTwice).to.be.true;
      expect(client.getCacheSize()).to.equal(2);
    });
    
    it('should clear cache when requested', async () => {
      mockMistral.chat.resolves('Cached response');
      
      // Add something to cache
      await client.chat([{ role: 'user', content: 'test clear cache' }]);
      expect(client.getCacheSize()).to.be.greaterThan(0);
      
      // Clear cache
      client.clearCache();
      expect(client.getCacheSize()).to.equal(0);
    });
  });
  
  describe('Method support checking', () => {
    it('should skip providers that do not support a method', async () => {
      // Make embedding not available on mistral
      delete mockMistral.embedding;
      
      // Make OpenAI embeddings work
      mockOpenAI.embedding.resolves([0.1, 0.2, 0.3]);
      
      const result = await client.embedding('test text');
      
      expect(result).to.deep.equal([0.1, 0.2, 0.3]);
      expect(mockOpenAI.embedding.calledOnce).to.be.true;
      // Should skip directly to OpenAI since Mistral doesn't have embedding
    });
  });
});
