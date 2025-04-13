class AIError extends Error {
    constructor(message, provider, code) {
        super(message);
        this.name = 'AIError';
        this.provider = provider;
        this.code = code;
    }
}

export default AIError;
