// spec/providers/mistral.spec.js
import { expect } from 'chai';
import { MistralAIClient } from '../../src/providers/mistral.js';

describe('Mistral Client', () => {
    describe('Unit Tests', () => {
        let client;
        let mockResponse;

        beforeEach(() => {
            client = new MistralAIClient({ apiKey: 'test-key' });
            mockResponse = {
                choices: [{
                    message: { content: 'test response' }
                }],
                data: [{ embedding: [0.1, 0.2, 0.3] }]
            };

            client.client = {
                chat: {
                    create: async () => mockResponse,
                    stream: async () => ({
                        async *[Symbol.asyncIterator]() {
                            yield { choices: [{ delta: { content: 'Hello' } }] };
                        }
                    })
                },
                embeddings: {
                    create: async () => mockResponse
                }
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
            const apiKey = process.env.MISTRAL_API_KEY;
            if (!apiKey) {
                console.warn('Skipping Mistral integration tests - no API key');
                return;
            }
            client = new MistralAIClient({ apiKey });
        });

        it('should perform chat completion', async function() {
            if (!process.env.MISTRAL_API_KEY) {
                this.skip();
                return;
            }

            const response = await client.chat([
                { role: 'user', content: 'What is the capital of France?' }
            ]);
            
            expect(response).to.be.a('string');
            expect(response.toLowerCase()).to.include('paris');
        });

        it('should generate embeddings', async function() {
            if (!process.env.MISTRAL_API_KEY) {
                this.skip();
                return;
            }

            const embedding = await client.embedding('Test text');
            expect(embedding).to.be.an('array');
            expect(embedding).to.have.length.greaterThan(0);
            embedding.forEach(value => {
                expect(value).to.be.a('number');
            });
        });

        it('should handle streaming', async function() {
            if (!process.env.MISTRAL_API_KEY) {
                this.skip();
                return;
            }

            const chunks = [];
            await client.stream(
                [{ role: 'user', content: 'Tell me a short joke' }],
                chunk => chunks.push(chunk)
            );

            expect(chunks.length).to.be.greaterThan(0);
            const fullResponse = chunks.join('');
            expect(fullResponse).to.be.a('string').and.to.have.length.greaterThan(10);
        });

        it('should handle errors gracefully', async function() {
            if (!process.env.MISTRAL_API_KEY) {
                this.skip();
                return;
            }

            const badClient = new MistralAIClient({ apiKey: 'invalid-key' });
            await expect(badClient.chat([
                { role: 'user', content: 'test' }
            ])).to.be.rejected;
        });
    });
});
