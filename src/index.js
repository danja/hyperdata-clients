// Improved barrel file for hyperdata-clients
// This file exports all modules with appropriate named exports

// Common utilities as named exports
import APIClient from './common/APIClient.js';
import APIError from './common/APIError.js';
import ClientFactory from './common/ClientFactory.js';
import KeyManager from './common/KeyManager.js';
import EmbeddingClient from './common/EmbeddingClient.js';
import EmbeddingFactory from './common/EmbeddingFactory.js';

// Provider classes
import Claude from './providers/Claude.js';
import Groqq from './providers/Groqq.js';
import HuggingFace from './providers/HuggingFace.js';
import MCP from './providers/MCP.js';
import Mistral from './providers/Mistral.js';
import Ollama from './providers/Ollama.js';
import OpenAIClient from './providers/OpenAI.js';
import Perplexity from './providers/Perplexity.js';

// Embedding providers
import NomicEmbeddingClient from './providers/NomicEmbedding.js';
import OllamaEmbeddingClient from './providers/OllamaEmbedding.js';

// Export all as named exports
export {
    // Common utilities
    APIClient,
    APIError,
    ClientFactory,
    KeyManager,
    EmbeddingClient,
    EmbeddingFactory,

    // Provider implementations
    Claude,
    Groqq,
    HuggingFace,
    MCP,
    Mistral,
    Ollama,
    OpenAIClient as OpenAI, // Renamed to more intuitive name
    Perplexity,

    // Embedding providers
    NomicEmbeddingClient,
    OllamaEmbeddingClient
};

// Also export a default object for CommonJS compatibility
export default {
    APIClient,
    APIError,
    ClientFactory,
    KeyManager,
    EmbeddingClient,
    EmbeddingFactory,
    Claude,
    Groqq,
    HuggingFace,
    MCP,
    Mistral,
    Ollama,
    OpenAI: OpenAIClient,
    Perplexity,
    NomicEmbeddingClient,
    OllamaEmbeddingClient
};

// Convenience function to create a client
export const createClient = (provider, config) => {
    return ClientFactory.createClient(provider, config);
};

// Convenience function to create an embedding client
export const createEmbeddingClient = (provider, config) => {
    return EmbeddingFactory.createEmbeddingClient(provider, config);
};