// Simple mock implementation for Groq client
class Groq {
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.GROQ_API_KEY;
        if (!this.apiKey) {
            throw new Error('The GROQ_API_KEY environment variable is missing or empty; either provide it, or instantiate the Groq client with an apiKey option, like new Groq({ apiKey: "My API Key" }).');
        }
        
        this.chat = {
            completions: {
                create: async ({ messages, model, stream }) => {
                    if (stream) {
                        return (async function* () {
                            yield { choices: [{ delta: { content: 'test ' } }] };
                            yield { choices: [{ delta: { content: 'response' } }] };
                        })();
                    }
                    return {
                        choices: [{ message: { content: 'test response' } }]
                    };
                }
            }
        };
    }
}

export { Groq };
