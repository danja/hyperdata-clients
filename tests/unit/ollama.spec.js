// spec/providers/ollama.spec.js
import { expect } from 'chai';
import { Ollama } from '../../src/providers/ollama.js';

describe('Ollama Client', () => {
    describe('Unit Tests', () => {
        let client;
        let mockOllama;

        beforeEach(() => {
            client = new Ollama({ baseUrl: 'http://localhost:11434' });
            mockOllama = {
                chat: async () => ({ message: { content: 'test response' } }),
                generate: async () => ({ response: 'test completion' }),
                embeddings: async () => ({ embedding: [0.1, 0.2, 0.3] })
            };
            global.ollama = mockOllama;
        });

        it('should handle chat completion', async () => {
            const response = await client.chat([{ role: 'user', content: 'test' }]);
            expect(response).to.equal('test response');
        });

        it('should handle direct completion', async () => {
            const response = await client.complete('test prompt');
            expect(response).to.equal('test completion');
        });

        it('should handle embeddings', async () => {
            const response = await client.embedding('test text');
            expect(response).to.deep.equal([0.1, 0.2, 0.3]);
        });
    });

    describe('Integration Tests', () => {
        let client;

        before(async () => {
            // Check if Ollama is running
            try {
                const response = await fetch('http://localhost:11434/api/version');
                if (!response.ok) {
                    console.warn('Skipping Ollama integration tests - service not running');
                    return;
                }
            } catch (e) {
                console.warn('Skipping Ollama integration tests - service not available');
                return;
            }
            client = new Ollama({});
        });

        it('should perform chat completion', async function () {
            if (!client) {
                this.skip();
                return;
            }

            const response = await client.chat([
                { role: 'user', content: 'What is 2+2?' }
            ], { model: 'llama2' });

            expect(response).to.be.a('string');
            expect(response.toLowerCase()).to.include('4');
        });

        it('should generate embeddings', async function () {
            if (!client) {
                this.skip();
                return;
            }

            const embedding = await client.embedding('Test text', {
                model: 'nomic-embed-text'
            });

            expect(embedding).to.be.an('array');
            expect(embedding).to.have.lengthOf(768); // nomic-embed-text dimension
            embedding.forEach(value => {
                expect(value).to.be.a('number');
            });
        });

        it('should handle streaming', async function () {
            if (!client) {
                this.skip();
                return;
            }

            const chunks = [];
            await client.stream(
                [{ role: 'user', content: 'Count to 3' }],
                chunk => chunks.push(chunk),
                { model: 'llama2' }
            );

            expect(chunks.length).to.be.greaterThan(0);
            const fullResponse = chunks.join('');
            expect(fullResponse).to.match(/[123]/);
        });

        it('should handle model not found errors', async function () {
            if (!client) {
                this.skip();
                return;
            }

            await expect(client.chat([
                { role: 'user', content: 'test' }
            ], { model: 'nonexistent-model' })).to.be.rejectedWith(/model.*not found/i);
        });
    });
});
