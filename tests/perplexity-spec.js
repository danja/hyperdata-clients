// spec/providers/perplexity.spec.js
import { expect } from 'chai';
import { PerplexityClient } from '../../src/providers/perplexity.js';

describe('Perplexity Client', () => {
    describe('Unit Tests', () => {
        let client;
        let mockResponse;

        beforeEach(() => {
            client = new PerplexityClient({ apiKey: 'test-key' });
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
            const apiKey = process.env.PERPLEXITY_API_KEY;
            if (!apiKey) {
                console.warn('Skipping Perplexity integration tests - no API key');
                return;
            }
            client = new PerplexityClient({ apiKey });
        });

        it('should perform chat completion', async function() {
            if (!process.env.PERPLEXITY_API_KEY) {
                this.skip();
                return;
            }

            const response = await client.chat([
                { role: 'user', content: 'What is the largest moon in our solar system?' }
            ]);
            
            expect(response).to.be.a('string');
            expect(response.toLowerCase()).to.include('ganymede');
        });

        it('should handle streaming', async function() {
            if (!process.env.PERPLEXITY_API_KEY) {
                this.skip();
                return;
            }

            const chunks = [];
            await client.stream(
                [{ role: 'user', content: 'Name three planets' }],
                chunk => chunks.push(chunk)
            );

            expect(chunks.length).to.be.greaterThan(0);
            const fullResponse = chunks.join('');
            expect(fullResponse).to.match(/mercury|venus|mars|jupiter|saturn|uranus|neptune/i);
        });

        it('should handle rate limits', async function() {
            if (!process.env.PERPLEXITY_API_KEY) {
                this.skip();
                return;
            }

            const promises = Array(10).fill().map(() => 
                client.chat([{ role: 'user', content: 'test' }])
            );

            await expect(Promise.all(promises))
                .to.be.rejectedWith(/rate limit/i);
        });
    });
});
