// providers/openai.js
import { OpenAI } from 'openai'
import APIClient from '../common/APIClient.js'
import APIError from '../common/APIError.js'

export class OpenAIClient extends APIClient {
    constructor(config = {}) {
        super(config)
        const apiKey = config.apiKey || process.env.OPENAI_API_KEY

        if (!apiKey) {
            throw new Error('OpenAI API key is required. Provide it in constructor or set OPENAI_API_KEY environment variable.')
        }

        this.client = new OpenAI({
            apiKey,
            ...config.clientOptions
        })
    }

    async chat(messages, options = {}) {
        try {
            const response = await this.client.chat.completions.create({
                model: options.model || 'gpt-4-turbo-preview',
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens,
                ...options
            })
            return response.choices[0].message.content
        } catch (error) {
            throw new APIError(error.message, 'openai', error.status)
        }
    }

    async complete(prompt, options = {}) {
        return await this.chat([{ role: 'user', content: prompt }], options)
    }

    async embedding(text, options = {}) {
        try {
            const input = Array.isArray(text) ? text : [text]
            const response = await this.client.embeddings.create({
                model: options.model || 'text-embedding-3-small',
                input,
                ...options
            })
            return Array.isArray(text) ? response.data.map(d => d.embedding) : response.data[0].embedding
        } catch (error) {
            throw new APIError(error.message, 'openai', error.status)
        }
    }

    async stream(messages, callback, options = {}) {
        try {
            const stream = await this.client.chat.completions.create({
                model: options.model || 'gpt-4-turbo-preview',
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens,
                stream: true,
                ...options
            })

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || ''
                callback(content)
            }
        } catch (error) {
            throw new APIError(error.message, 'openai', error.status)
        }
    }
}

export default OpenAIClient
