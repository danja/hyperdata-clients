import { expect } from 'chai';
import { Groq } from '../../helpers/mockGroq.js';
import Groqq from '../../../src/providers/Groqq.js';
import APIError from '../../../src/common/APIError.js';

describe('Groqq Provider', () => {
    let groq;
    const TEST_API_KEY = 'test-api-key';
    const TEST_MESSAGE = [{ role: 'user', content: 'Hello' }];

    beforeEach(() => {
        // Clear any existing env vars
        delete process.env.GROQ_API_KEY;
        groq = new Groqq({ apiKey: TEST_API_KEY });
    });

    describe('Constructor', () => {
        it('should initialize with API key from config', () => {
            const client = new Groqq({ apiKey: TEST_API_KEY });
            expect(client).to.be.instanceOf(Groqq);
        });

        it('should initialize with API key from environment', () => {
            process.env.GROQ_API_KEY = TEST_API_KEY;
            const client = new Groqq();
            expect(client).to.be.instanceOf(Groqq);
        });

        it('should throw error if no API key provided', () => {
            expect(() => new Groqq()).to.throw('Groq API key is required');
        });
    });

    describe('Chat', () => {
        it('should generate chat response', async () => {
            const response = await groq.chat(TEST_MESSAGE);
            expect(response).to.equal('test response');
        });

        it('should pass model option to client', async () => {
            const response = await groq.chat(TEST_MESSAGE, { model: 'custom-model' });
            expect(response).to.equal('test response');
        });

        it('should handle streaming responses', async () => {
            let received = '';
            await groq.stream(TEST_MESSAGE, (content) => {
                received += content;
            });
            expect(received).to.equal('test response');
        });
    });

    describe('Complete', () => {
        it('should wrap prompt in chat message', async () => {
            const response = await groq.complete('test prompt');
            expect(response).to.equal('test response');
        });
    });

    describe('Embedding', () => {
        it('should throw error for embedding requests', async () => {
            await expect(groq.embedding('test')).to.be.rejectedWith(APIError);
        });
    });
});
