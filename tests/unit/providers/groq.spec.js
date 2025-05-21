import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { Groq } from '../../helpers/mockGroq.js';
import Groqq from '../../../src/providers/Groqq.js';
import APIError from '../../../src/common/APIError.js';

// Mock the Groq import in the Groqq module
vi.mock('../../helpers/mockGroq.js', () => ({
    Groq: vi.fn()
}));

// Store the original NODE_ENV
const originalNodeEnv = process.env.NODE_ENV;

describe('Groqq Provider', () => {
    let groq;
    const TEST_API_KEY = 'test-api-key';
    const TEST_MESSAGE = [{ role: 'user', content: 'Hello' }];
    let mockCreate;
    let originalEnv;

    beforeEach(() => {
        // Save original env
        originalEnv = { ...process.env };
        
        // Set NODE_ENV to test to ensure the mock is used
        process.env.NODE_ENV = 'test';
        
        // Clear any existing env vars
        delete process.env.GROQ_API_KEY;
        
        // Reset all mocks
        vi.clearAllMocks();
        
        // Set up the mock implementation
        mockCreate = vi.fn().mockImplementation(({ stream }) => {
            if (stream) {
                return (async function* () {
                    yield { choices: [{ delta: { content: 'test ' } }] };
                    yield { choices: [{ delta: { content: 'response' } }] };
                })();
            }
            return { choices: [{ message: { content: 'test response' } }] };
        });
        
        Groq.mockImplementation(() => ({
            chat: {
                completions: {
                    create: mockCreate
                }
            }
        }));
        
        // Create a new instance for each test
        groq = new Groqq({ apiKey: TEST_API_KEY });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        process.env = originalEnv;
    });
    
    afterAll(() => {
        // Restore original NODE_ENV
        process.env.NODE_ENV = originalNodeEnv;
    });
    
    // Helper function to get the latest mock instance
    const getLatestMockInstance = () => {
        const mockInstances = Groq.mock.results || [];
        return mockInstances.length > 0 ? mockInstances[mockInstances.length - 1].value : null;
    };

    describe('Constructor', () => {
        it('should initialize with API key from config', () => {
            const client = new Groqq({ apiKey: TEST_API_KEY });
            expect(client).toBeInstanceOf(Groqq);
            expect(Groq).toHaveBeenCalled();
            const mockInstance = getLatestMockInstance();
            expect(mockInstance).toBeTruthy();
        });

        it('should initialize with API key from environment', () => {
            process.env.GROQ_API_KEY = TEST_API_KEY;
            const client = new Groqq();
            expect(client).toBeInstanceOf(Groqq);
            expect(Groq).toHaveBeenCalled();
            const mockInstance = getLatestMockInstance();
            expect(mockInstance).toBeTruthy();
        });

        it('should throw error if no API key provided', () => {
            delete process.env.GROQ_API_KEY;
            Groq.mockImplementationOnce(() => {
                throw new Error('The GROQ_API_KEY environment variable is missing or empty');
            });
            expect(() => new Groqq()).toThrow('Groq API key is required');
        });
    });

    describe('Chat', () => {
        it('should generate chat response', async () => {
            const response = await groq.chat(TEST_MESSAGE);
            expect(response).toBe('test response');
            const call = mockCreate.mock.calls[0][0];
            expect(call.messages).toEqual(TEST_MESSAGE);
            expect(call.model).toBe('llama3-8b-8192');
            expect(call.temperature).toBe(0.7);
            expect(call.stream).toBeFalsy();
        });

        it('should pass model option to client', async () => {
            await groq.chat(TEST_MESSAGE, { model: 'custom-model' });
            
            const call = mockCreate.mock.calls[0][0];
            expect(call.messages).toEqual(TEST_MESSAGE);
            expect(call.model).toBe('custom-model');
            expect(call.temperature).toBe(0.7);
            expect(call.stream).toBeFalsy();
        });

        it('should handle streaming responses', async () => {
            const callback = vi.fn();
            await groq.stream(TEST_MESSAGE, callback);
            
            expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
                messages: TEST_MESSAGE,
                model: 'llama3-8b-8192',
                temperature: 0.7,
                stream: true
            }));
            
            // Wait for the stream to be processed
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenNthCalledWith(1, 'test ');
            expect(callback).toHaveBeenNthCalledWith(2, 'response');
        });
    });

    describe('Complete', () => {
        it('should wrap prompt in chat message', async () => {
            mockCreate.mockResolvedValueOnce({
                choices: [{ message: { content: 'test response' } }]
            });
            
            const response = await groq.complete('test prompt');
            
            const call = mockCreate.mock.calls[0][0];
            expect(call.messages).toEqual([{ role: 'user', content: 'test prompt' }]);
            expect(call.model).toBe('llama3-8b-8192');
            expect(call.temperature).toBe(0.7);
            expect(call.stream).toBeFalsy();
            expect(response).to.equal('test response');
        });
    });

    describe('Embedding', () => {
        it('should throw error for embedding requests', async () => {
            await expect(groq.embedding('test')).rejects.toThrow(APIError);
        });
    });
});
