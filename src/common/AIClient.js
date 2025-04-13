class AIClient {
    constructor(config = {}) {
        if (this.constructor === AIClient) {
            throw new Error('Cannot instantiate abstract class');
        }
        this.config = config;
    }

    async chat(messages, options = {}) {
        throw new Error('Method chat() must be implemented');
    }

    async complete(prompt, options = {}) {
        throw new Error('Method complete() must be implemented');
    }

    async embedding(text, options = {}) {
        throw new Error('Method embedding() must be implemented');
    }

    async stream(messages, callback, options = {}) {
        throw new Error('Method stream() must be implemented');
    }
}

export default AIClient;
