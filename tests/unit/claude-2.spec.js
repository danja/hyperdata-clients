import { expect } from 'chai';
import { ClaudeClient } from '../../src/providers/ClaudeClient.js';

describe('Claude Client', () => {
    describe('Unit Tests', () => {
        let client;
        let mockResponse;

        beforeEach(() => {
            client = new ClaudeClient({ apiKey: 'test-key' });
            mockResponse = {
                content: [{ text: 'test response' }],
                embeddings: [[0.1, 0.2, 0.3]]
            };

            // Mock Anthropic client methods
            client.client = {
                messages: {
                    create: async () => mockResponse
                },
                embeddings: {
                    create: async () => ({ embeddings: [[0.1, 0.2, 0.3]] })
                }
            };
        });

        it('should require API key', () => {
            expect(() => new ClaudeClient()).to.throw(/API key is required/);
        });

        it('should handle chat completion', async () => {
            const response = await client.chat([
                { role: 'user', content: 'test' }
            ]);
            expect(response).to.equal('test response');
        });

        it('should handle direct completion', async () => {
            const response = await client.complete('test prompt');
            expect(response).to.equal('test response');
        });

        it('should handle embeddings', async () => {
            const response = await client.embedding('test text');
            expect(response).to.deep.equal([0.1, 0.2, 0.3]);
        });

        it('should handle streaming', async () => {
            const chunks = [];
            const mockStream = {
                async *[Symbol.asyncIterator]() {
                    yield { delta: { text: 'Hello' } };
                    yield { delta: { text: ' World' } };
                }
            };

            client.client.messages.create = async () => mockStream;

            await client.stream(
                [{ role: 'user', content: 'test' }],
                chunk => chunks.push(chunk)
            );

            expect(chunks).to.deep.equal(['Hello', ' World']);
        });

        it('should handle API errors', async () => {
            client.client.messages.create = async () => {
                throw new Error('API Error');
            };

            await expect(client.chat([]))
                .to.be.rejectedWith('API Error');
        });
    });

    describe('Integration Tests', () => {
        let client;

        before(() => {
            const apiKey = process.env.CLAUDE_API_KEY;
            if (!apiKey) {
                console.warn('Skipping Claude integration tests - no API key');
                return;
            }
            client = new ClaudeClient({ apiKey });
        });

        it('should perform chat completion', async function() {
            if (!process.env.CLAUDE_API_KEY) {
                this.skip();
                return;
            }

            const response = await client.chat([
                { role: 'user', content: 'What is 2+2?' }
            ]);
            
            expect(response).to.be.a('string');
            expect(response.toLowerCase()).to.include('4');
        });

        it('should generate embeddings', async function() {
            if (!process.env.CLAUDE_API_KEY) {
                this.skip();
                return;
            }

            const embedding = await client.embedding('Test text');
            expect(embedding).to.be.an('array');
            embedding.forEach(value => {
                expect(value).to.be.a('number');
            });
        });

        it('should handle streaming', async function() {
            if (!process.env.CLAUDE_API_KEY) {
                this.skip();
                return;
            }

            const chunks = [];
            await client.stream(
                [{ role: 'user', content: 'Count to 3' }],
                chunk => chunks.push(chunk)
            );

            expect(chunks.length).to.be.greaterThan(0);
            const fullResponse = chunks.join('');
            expect(fullResponse).to.include('1');
            expect(fullResponse).to.include('2');
            expect(fullResponse).to.include('3');
        });

        it('should handle model-specific parameters', async function() {
            if (!process.env.CLAUDE_API_KEY) {
                this.skip();
                return;
            }

            const response = await client.chat([
                { role: 'user', content: 'Hello' }
            ], {
                model: 'claude-3-sonnet-20240229',
                temperature: 0.5,
                maxTokens: 100
            });

            expect(response).to.be.a('string');
            expect(response.length).to.be.greaterThan(0);
        });
    });
});