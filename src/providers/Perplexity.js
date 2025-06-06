import OpenAI from 'openai'
import APIClient from '../common/APIClient.js'
import APIError from '../common/APIError.js'

export class Perplexity extends APIClient {
    constructor(config = {}) {
        super(config)
        const apiKey = config.apiKey || process.env.PERPLEXITY_API_KEY

        if (!apiKey) {
            throw new Error('Perplexity API key is required. Provide it in constructor or set PERPLEXITY_API_KEY environment variable.')
        }

        this.client = new OpenAI({
            apiKey,
            baseURL: 'https://api.perplexity.ai',
            ...config.clientOptions
        })
    }

    async chat(messages, options = {}) {
        try {
            const response = await this.client.chat.completions.create({
                model: options.model || 'pplx-7b-chat',
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens,
                ...options
            })
            return response.choices[0].message.content
        } catch (error) {
            throw new APIError(error.message, 'perplexity', error.status)
        }
    }

    async complete(prompt, options = {}) {
        return await this.chat([{ role: 'user', content: prompt }], options)
    }

    async embedding(text, options = {}) {
        throw new APIError('Embeddings not supported by Perplexity', 'perplexity', 'UNSUPPORTED_OPERATION')
    }

    async stream(messages, callback, options = {}) {
        try {
            const stream = await this.client.chat.completions.create({
                model: options.model || 'pplx-7b-chat',
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens,
                stream: true,
                ...options
            })

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || ''
                if (content) callback(content)
            }
        } catch (error) {
            throw new APIError(error.message, 'perplexity', error.status)
        }
    }
}

export default Perplexity