import { HfInference } from '@huggingface/inference';
import { AIClient, AIError } from '../base-client.js';

export class HuggingFaceClient extends AIClient {
    constructor(config = {}) {
        super(config);
        const apiKey = config.apiKey || process.env.HUGGINGFACE_API_KEY;

        if (!apiKey) {
            throw new Error('HuggingFace API key is required. Provide it in constructor or set HUGGINGFACE_API_KEY environment variable.');
        }

        this.client = new HfInference(apiKey);
    }

    async chat(messages, options = {}) {
        try {
            const input = messages.map(m => `${m.role}: ${m.content}`).join('\n');
            const response = await this.client.textGeneration({
                model: options.model || 'gpt2',
                inputs: input,
                parameters: {
                    max_new_tokens: options.maxTokens || 50,
                    temperature: options.temperature || 0.7,
                    ...options.parameters
                }
            });
            return response.generated_text;
        } catch (error) {
            throw new AIError(error.message, 'huggingface', error.status);
        }
    }

    async complete(prompt, options = {}) {
        try {
            const response = await this.client.textGeneration({
                model: options.model || 'gpt2',
                inputs: prompt,
                parameters: {
                    max_new_tokens: options.maxTokens || 50,
                    temperature: options.temperature || 0.7,
                    ...options.parameters
                }
            });
            return response.generated_text;
        } catch (error) {
            throw new AIError(error.message, 'huggingface', error.status);
        }
    }

    async embedding(text, options = {}) {
        try {
            const response = await this.client.featureExtraction({
                model: options.model || 'sentence-transformers/all-MiniLM-L6-v2',
                inputs: text instanceof Array ? text : [text],
                ...options
            });
            return response[0];
        } catch (error) {
            throw new AIError(error.message, 'huggingface', error.status);
        }
    }

    async stream(messages, callback, options = {}) {
        throw new AIError('Streaming not supported by HuggingFace Inference API', 'huggingface', 'UNSUPPORTED_OPERATION');
    }
}