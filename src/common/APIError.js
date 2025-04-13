class APIError extends Error {
    constructor(message, provider, code) {
        super(message);
        this.name = 'APIError';
        this.provider = provider;
        this.code = code;
    }
}

export default APIError;
