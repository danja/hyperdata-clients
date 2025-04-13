// spec/providers/huggingface.spec.js
import { expect } from 'chai';
import { HuggingFace } from '../../src/providers/huggingface.js';

describe('HuggingFace Client', () => {
    describe('Unit Tests', () => {
        let client;
        let mockResponse;

        beforeEach(() => {
            client = new HuggingFace({ apiKey: 'test-key' });
            mockResponse = {
                generated_text: 'test response',
                embeddings: [[0.1, 0.2, 0.3]]
            };

            client.client = {
                textGeneration: async () => mockResponse,
                featureExtraction: async () => [[0.1, 0.2, 0.3]]
            };
        });

        it('should handle text generation', async () => {
            const response = await client.complete('test prompt');
            expect(response).to.equal('test response');
        });

        it('should handle embeddings', async () => {
            const response = await client.embedding('test text');
            expect(response).to.deep.equal([0.1, 0.2, 0.3]);
        });

        it('should throw for streaming', async () => {
            await expect(client.stream([])).to.be.rejectedWith(/not supported/);
        });
    });

    describe('Integration Tests', () => {
        let client;

        before(() => {
            const apiKey = process.env.HUGGINGFACE_API_KEY;
            if (!apiKey) {
                console.warn('Skipping HuggingFace integration tests - no API key');
                return;
            }
            client = new HuggingFace({ apiKey });
        });

        it('should perform text completion', async function () {
            if (!process.env.HUGGINGFACE_API_KEY) {
                this.skip();
                return;
            }

            const response = await client.complete('The capital of France is');
            expect(response).to.be.a('string');
            expect(response.toLowerCase()).to.include('paris');
        });

        it('should generate embeddings', async function () {
            if (!process.env.HUGGINGFACE_API_KEY) {
                this.skip();
                return;
            }

            const embedding = await client.embedding('Test text', {
                model: 'sentence-transformers/all-MiniLM-L6-v2'
            });

            expect(embedding).to.be.an('array');
            expect(embedding.length).to.equal(384); // MiniLM dimension
            embedding.forEach(value => {
                expect(value).to.be.a('number');
            });
        });

        it('should handle chat-like interactions', async function () {
            if (!process.env.HUGGINGFACE_API_KEY) {
                this.skip();
                return;
            }

            const response = await client.chat([
                { role: 'user', content: 'What is machine learning?' }
            ]);

            expect(response).to.be.a('string');
            expect(response.length).to.be.greaterThan(20);
        });

        it('should handle model-specific parameters', async function () {
            if (!process.env.HUGGINGFACE_API_KEY) {
                this.skip();
                return;
            }

            const response = await client.complete('Once upon a time', {
                model: 'gpt2',
                parameters: {
                    do_sample: true,
                    max_new_tokens: 50,
                    temperature: 0.7
                }
            });

            expect(response).to.be.a('string');
            expect(response.length).to.be.greaterThan(10);
        });
    });
});
