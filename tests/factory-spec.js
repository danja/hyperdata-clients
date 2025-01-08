// spec/factory.spec.js
import { expect } from 'chai';
import { createAIClient } from '../src/factory.js';
import { OpenAIClient } from '../src/providers/openai.js';
import { ClaudeClient } from '../src/providers/claude.js';

describe('AIClient Factory', () => {
    it('should create OpenAI client', () => {
        const client = createAIClient('openai', { apiKey: 'test' });
        expect(client).to.be.instanceOf(OpenAIClient);
    });

    it('should create Claude client', () => {
        const client = createAIClient('claude', { apiKey: 'test' });
        expect(client).to.be.instanceOf(ClaudeClient);
    });

    it('should throw error for unknown provider', () => {
        expect(() => createAIClient('unknown')).to.throw('Unknown AI provider: unknown');
    });

    it('should be case insensitive', () => {
        const client = createAIClient('OPENAI', { apiKey: 'test' });
        expect(client).to.be.instanceOf(OpenAIClient);
    });
});
