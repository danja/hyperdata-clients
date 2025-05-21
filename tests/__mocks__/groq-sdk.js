// Mock implementation of the Groq SDK
class MockGroq {
    constructor(config = {}) {
        this.config = config;
        this.chat = {
            completions: {
                create: vi.fn().mockResolvedValue({
                    choices: [{
                        message: { content: 'test response' }
                    }]
                })
            }
        };
    }
}

const Groq = vi.fn().mockImplementation((config) => {
    return new MockGroq(config);
});

export { Groq };
