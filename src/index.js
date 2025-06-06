// Improved barrel file for hyperdata-clients
// This file exports all modules with appropriate named exports

// Common utilities as named exports
import APIClient from './common/APIClient.js';
import APIError from './common/APIError.js';
import ClientFactory from './common/ClientFactory.js';
import KeyManager from './common/KeyManager.js';

// Provider classes
import Claude from './providers/Claude.js';
import Groqq from './providers/Groqq.js';
import HuggingFace from './providers/HuggingFace.js';
import MCP from './providers/MCP.js';
import Mistral from './providers/Mistral.js';
import Ollama from './providers/Ollama.js';
import OpenAIClient from './providers/OpenAI.js';
import Perplexity from './providers/Perplexity.js';

// Export all as named exports
export {
    // Common utilities
    APIClient,
    APIError,
    ClientFactory,
    KeyManager,

    // Provider implementations
    Claude,
    Groqq,
    HuggingFace,
    MCP,
    Mistral,
    Ollama,
    OpenAIClient as OpenAI, // Renamed to more intuitive name
    Perplexity
};

// Also export a default object for CommonJS compatibility
export default {
    APIClient,
    APIError,
    ClientFactory,
    KeyManager,
    Claude,
    Groqq,
    HuggingFace,
    MCP,
    Mistral,
    Ollama,
    OpenAI: OpenAIClient,
    Perplexity
};

// Convenience function to create a client
export const createClient = (provider, config) => {
    return ClientFactory.createClient(provider, config);
};