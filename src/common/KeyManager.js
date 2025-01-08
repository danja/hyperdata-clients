
export class KeyManager {
    static validateKey(key, provider) {
        if (!key) {
            throw new Error(`${provider} API key is required`);
        }

        const patterns = {
            openai: /^sk-[a-zA-Z0-9]{32,}$/,
            claude: /^sk-ant-[a-zA-Z0-9]{32,}$/,
            mistral: /^[a-zA-Z0-9]{32,}$/,
            groq: /^gsk_[a-zA-Z0-9]{32,}$/,
            perplexity: /^pplx-[a-zA-Z0-9]{32,}$/,
            huggingface: /^hf_[a-zA-Z0-9]{32,}$/
        };

        if (patterns[provider] && !patterns[provider].test(key)) {
            throw new Error(`Invalid ${provider} API key format`);
        }
    }

    static getKey(config, provider) {
        const key = config.apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];
        this.validateKey(key, provider);
        return key;
    }

    static rotateKey(config, provider, newKey) {
        this.validateKey(newKey, provider);
        const envVar = `${provider.toUpperCase()}_API_KEY`;
        process.env[envVar] = newKey;
        return newKey;
    }
}