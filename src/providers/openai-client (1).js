// providers/openai.js
import OpenAI from 'openai';
import { AIClient, AIError } from '../base-client.js';

export class OpenAIClient extends AIClient {
    constructor(config = {}) {
        super(config);
        this.client = new OpenAI({
            apiKey: config.apiKey || process.env.OPENAI_API_KEY,
            ...config.clientOptions
        });

        if (!this.client.apiKey) {
            throw new Error('OpenAI API key is required. Provide it in constructor or set OPENAI_API_KEY environment variable.');
        }
    }
    
    // ... rest of implementation remains the same
}