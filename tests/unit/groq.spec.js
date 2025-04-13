// spec/providers/groq.spec.js
import { expect } from 'chai';
import { Groq } from '../../src/providers/groq.js';

describe('Groq Client', () => {
    describe('Unit Tests', () => {
        let client;
        let mockResponse;

        beforeEach(() => {
            client = new Groq({ apiKey: 'test-key' });
            mockResponse = {
                choices: [{
                    message: { content: 'test response' },
                    delta: { content: 'test chunk' }
                }]
            };

            client.client = {
                chat: {
                    completions: {
                        create: async () => mockResponse
                    }
                }
            };
        });

        it('should handle chat completion', async () => {
            const response = await client.chat([{ role: 'user', content: 'test' }]);
            expect(response).to.equal('test response');
        });

        it('should throw for embeddings', async () => {
            await expect(client.embedding('test')).to.be.rejectedWith(/not supported/);
        });
    });

    describe('Integration Tests', () => {
        let client;

        before(() => {
            const apiKey = process.env.GROQ_API_KEY;
            if (!apiKey) {
                console.warn('Skipping Groq integration tests - no API key');
                return;
            }
            client = new Groq({ apiKey });
        });

        it('should perform chat completion', async function () {
            if (!process.env.GROQ_API_KEY) {
                this.skip();
                return;
            }

            const response = await client.chat([
                { role: 'user', content: 'What is quantum computing?' }
            ]);

            expect(response).to.be.a('string');
            expect(response.length).to.be.greaterThan(50);
        });

        it('should handle streaming', async function () {
            if (!process.env.GROQ_API_KEY) {
                this.skip();
                return;
            }

            const chunks = [];
            await client.stream(
                [{ role: 'user', content: 'Explain recursion briefly' }],
                chunk => chunks.push(chunk)
            );

            expect(chunks.length).to.be.greaterThan(0);
            const fullResponse = chunks.join('');
            expect(fullResponse).to.include('recurs');
        });
    });
});
