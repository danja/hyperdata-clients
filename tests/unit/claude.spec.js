// spec/providers/claude.spec.js
import { expect } from 'chai';
import { Claude } from '../../src/providers/claude.js';

describe('Claude Client', () => {
    describe('Unit Tests', () => {
        let client;
        let mockResponse;

        beforeEach(() => {
            client = new Claude({ apiKey: 'test-key' });
            mockResponse = {
                data: {
                    choices: [{
                        message: { content: 'test response' }
                    }],
                    data: [{ embedding: [0.1, 0.2, 0.3] }]
                }
            };

            client.client = {
                createCompletion: async () => mockResponse,
                createEmbedding: async () => mockResponse,
                createCompletionStream: async () => ({
                    async *[Symbol.asyncIterator]() {
                        yield { choices: [{ delta: { content: 'Hello' } }] };
                    }
                })
            };
        });

        it('should handle chat completion', async () => {
            const response = await client.chat([{ role: 'user', content: 'test' }]);
            expect(response).to.equal('test response');
        });

        it('should handle embeddings', async () => {
            const response = await client.embedding('test text');
            expect(response).to.deep.equal([0.1, 0.2, 0.3]);
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
            client = new Claude({ apiKey });
        });

        it('should perform chat completion', async function () {
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

        it('should generate embeddings', async function () {
            if (!process.env.CLAUDE_API_KEY) {
                this.skip();
                return;
            }

            const embedding = await client.embedding('Test text');
            expect(embedding).to.be.an('array');
            expect(embedding).to.have.lengthOf(1536);
            embedding.forEach(value => {
                expect(value).to.be.a('number');
            });
        });

        it('should handle streaming', async function () {
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
    });
});
