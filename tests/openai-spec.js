// spec/providers/openai.spec.js
import { expect } from 'chai';
import { OpenAIClient } from '../../src/providers/openai.js';

describe('OpenAI Client', () => {
    let client;
    let mockResponse;

    beforeEach(() => {
        client = new OpenAIClient({ apiKey: 'test-key' });
        mockResponse = {
            choices: [{
                message: { content: 'test response' },
                text: 'test completion'
            }],
            data: [{ embedding: [0.1, 0.2, 0.3] }]
        };

        // Mock OpenAI client methods
        client.client = {
            chat: {
                completions: {
                    create: async () => mockResponse
                }
            },
            completions: {
                create: async () => mockResponse
            },
            embeddings: {
                create: async () => mockResponse
            }
        };
    });

    describe('chat', () => {
        it('should return chat completion', async () => {
            const response = await client.chat([{ role: 'user', content: 'test' }]);
            expect(response).to.equal('test response');
        });

        it('should handle errors', async () => {
            client.client.chat.completions.create = async () => {
                throw new Error('API Error');
            };
            await expect(client.chat([])).to.be.rejectedWith('API Error');
        });
    });

    describe('complete', () => {
        it('should return completion', async () => {
            const response = await client.complete('test prompt');
            expect(response).to.equal('test completion');
        });
    });

    describe('embedding', () => {
        it('should return embeddings', async () => {
            const response = await client.embedding('test text');
            expect(response).to.deep.equal([0.1, 0.2, 0.3]);
        });
    });

    describe('stream', () => {
        it('should handle streaming responses', async () => {
            const chunks = [];
            const mockStream = {
                async *[Symbol.asyncIterator]() {
                    yield { choices: [{ delta: { content: 'Hello' } }] };
                    yield { choices: [{ delta: { content: ' World' } }] };
                }
            };

            client.client.chat.completions.create = async () => mockStream;

            await client.stream(
                [{ role: 'user', content: 'test' }],
                chunk => chunks.push(chunk)
            );

            expect(chunks).to.deep.equal(['Hello', ' World']);
        });
    });
});
