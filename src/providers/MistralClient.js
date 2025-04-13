import MistralClient from '@mistralai/mistralai'
import { AIClient, AIError } from '../common/AIClient.js'

export class MistralClient extends AIClient {
    constructor(config = {}) {
        super(config)
        const apiKey = config.apiKey || process.env.MISTRAL_API_KEY

        if (!apiKey) {
            throw new Error('Mistral API key is required. Provide it in constructor or set MISTRAL_API_KEY environment variable.')
        }

        this.client = new MistralClient({
            apiKey,
            ...config.clientOptions
        })
    }

    async chat(messages, options = {}) {
        try {
            const response = await this.client.chat.create({
                model: options.model || 'mistral-tiny',
                messages,
                maxTokens: options.maxTokens,
                temperature: options.temperature || 0.7,
                ...options
            })
            return response.choices[0].message.content
        } catch (error) {
            throw new AIError(error.message, 'mistral', error.status)
        }
    }

    async complete(prompt, options = {}) {
        return this.chat([{ role: 'user', content: prompt }], options)
    }

    async embedding(text, options = {}) {
        try {
            const response = await this.client.embeddings.create({
                model: options.model || 'mistral-embed',
                input: text instanceof Array ? text : [text],
                ...options
            })
            return response.data[0].embedding
        } catch (error) {
            throw new AIError(error.message, 'mistral', error.status)
        }
    }

    async stream(messages, callback, options = {}) {
        try {
            const stream = await this.client.chat.stream({
                model: options.model || 'mistral-tiny',
                messages,
                maxTokens: options.maxTokens,
                temperature: options.temperature || 0.7,
                ...options
            })

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || ''
                if (content) callback(content)
            }
        } catch (error) {
            throw new AIError(error.message, 'mistral', error.status)
        }
    }
}

export default MistralClient;