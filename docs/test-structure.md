tests/
├── fixtures/ # Test data and mock responses
│ ├── responses/ # Mock API responses
│ └── data/ # Test input data
├── helpers/ # Test utilities and setup
│ ├── setup.js # Global test setup
│ ├── mocks.js # Common mock objects
│ └── reporter.js # Custom test reporter
├── integration/ # Integration tests
│ ├── providers/ # Tests for each provider
│ │ ├── claude.spec.js
│ │ ├── groq.spec.js
│ │ ├── mistral.spec.js
│ │ ├── ollama.spec.js
│ │ ├── openai.spec.js
│ │ └── perplexity.spec.js
│ └── mcp/ # MCP integration tests
│ └── mcp.spec.js
└── unit/ # Unit tests
├── common/ # Tests for common utilities
│ ├── client.spec.js
│ ├── factory.spec.js
│ └── key-manager.spec.js
└── providers/ # Provider-specific unit tests
├── claude.spec.js
├── groq.spec.js
├── mistral.spec.js
├── ollama.spec.js
├── openai.spec.js
└── perplexity.spec.js

// helpers/setup.js
import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: path.resolve(process.cwd(), '.env.test') });

// Global test timeout
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

// helpers/mocks.js
export const mockResponses = {
chat: {
success: {
choices: [{
message: { content: 'test response' }
}]
},
error: {
error: {
message: 'Test error',
type: 'invalid_request_error'
}
}
}
};

// integration/providers/mistral.spec.js
import { expect } from 'chai';
import { Mistral } from '../../../src/providers/Mistral.js';
import { mockResponses } from '../../helpers/mocks.js';

describe('Mistral Integration Tests', () => {
let client;

beforeEach(() => {
client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
});

// Test cases...
});
