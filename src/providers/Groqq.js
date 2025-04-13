import { Groq } from 'groq-sdk'
import APIClient from '../common/APIClient.js'
import APIError from '../common/APIError.js'

export class Groqq extends APIClient {
    constructor(config = {}) {
        super(config)
        const apiKey = config.apiKey || process.env.GROQ_API_KEY

        if (!apiKey) {
            throw new Error('Groq API key is required. Provide it in constructor or set GROQ_API_KEY environment variable.')
        }

        this.client = new GroqClient({
            apiKey,
            ...config.clientOptions
        })
    }

    async chat(messages, options = {}) {
        try {
            const response = await this.client.chat.completions.create({
                model: options.model || 'llama3-8b-8192',
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens,
                ...options
            })
            return response.choices[0].message.content
        } catch (error) {
            throw new APIError(error.message, 'groq', error.status)
        }
    }

    async complete(prompt, options = {}) {
        return this.chat([{ role: 'user', content: prompt }], options)
    }

    async embedding(text, options = {}) {
        throw new APIError('Embeddings not supported by Groq', 'groq', 'UNSUPPORTED_OPERATION')
    }

    async stream(messages, callback, options = {}) {
        try {
            const stream = await this.client.chat.completions.create({
                model: options.model || 'llama3-8b-8192',
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
            throw new APIError(error.message, 'groq', error.status)
        }
    }
}

export default Groq