import Anthropic from '@anthropic-ai/sdk'
import { AIClient, AIError } from '../common/AIClient.js'

export class ClaudeClient extends AIClient {
    constructor(config = {}) {
        super(config)
        const apiKey = config.apiKey || process.env.CLAUDE_API_KEY

        if (!apiKey) {
            throw new Error('Claude API key is required. Provide it in constructor or set CLAUDE_API_KEY environment variable.')
        }

        this.client = new Anthropic({
            apiKey,
            ...config.clientOptions
        })
    }

    async chat(messages, options = {}) {
        try {
            const response = await this.client.messages.create({
                model: options.model || 'claude-3-opus-20240229',
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens,
                ...options
            })
            return response.content[0].text
        } catch (error) {
            throw new AIError(error.message, 'claude', error.status)
        }
    }

    async complete(prompt, options = {}) {
        return this.chat([{ role: 'user', content: prompt }], options)
    }

    async embedding(text, options = {}) {
        try {
            const response = await this.client.embeddings.create({
                model: options.model || 'claude-3-embedding',
                input: text instanceof Array ? text : [text],
                ...options
            })
            return response.embeddings[0]
        } catch (error) {
            throw new AIError(error.message, 'claude', error.status)
        }
    }

    async stream(messages, callback, options = {}) {
        try {
            const stream = await this.client.messages.create({
                model: options.model || 'claude-3-opus-20240229',
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens,
                stream: true,
                ...options
            })

            for await (const chunk of stream) {
                const content = chunk.delta?.text || ''
                if (content) callback(content)
            }
        } catch (error) {
            throw new AIError(error.message, 'claude', error.status)
        }
    }
}