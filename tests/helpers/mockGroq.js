// Mock implementation of groq-sdk
class Groq {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.GROQ_API_KEY || 'mock-default-key'
        if (!this.apiKey) {
            throw new Error('The GROQ_API_KEY environment variable is missing or empty; either provide it, or instantiate the Groq client with an apiKey option, like new Groq({ apiKey: \"My API Key\" }).')
        }
        this.chat = {
            completions: {
                create: async ({ messages, stream }) => {
                    if (stream) {
                        return {
                            async *[Symbol.asyncIterator]() {
                                yield { choices: [{ delta: { content: 'test response' } }] }
                            }
                        }
                    }
                    return {
                        choices: [{ message: { content: 'test response' } }]
                    }
                }
            }
        }
    }
}

export { Groq }
