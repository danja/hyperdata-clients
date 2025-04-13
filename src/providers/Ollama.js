import ollama from 'ollama'
import APIClient from '../common/APIClient.js'
import APIError from '../common/APIError.js'

export class Ollama extends APIClient {
    constructor(config = {}) {
        super(config)
        this.baseUrl = config.baseUrl || process.env.OLLAMA_HOST || 'http://localhost:11434'
    }

    async chat(messages, options = {}) {
        try {
            // 'llama2'
            const response = await ollama.chat({
                model: options.model || this.config.model || 'qwen2:1.5b',
                messages,
                ...options
            }, { baseUrl: this.baseUrl })
            return response.message.content
        } catch (error) {
            throw new APIError(error.message, 'ollama', error.code)
        }
    }

    async complete(prompt, options = {}) {
        try {
            const response = await ollama.generate({
                model: options.model || 'llama2',
                prompt,
                ...options
            }, { baseUrl: this.baseUrl })
            return response.response
        } catch (error) {
            throw new APIError(error.message, 'ollama', error.code)
        }
    }

    async embedding(text, options = {}) {
        try {
            const response = await ollama.embeddings({
                model: options.model || 'nomic-embed-text',
                prompt: text,
                ...options
            }, { baseUrl: this.baseUrl })
            return response.embedding
        } catch (error) {
            throw new APIError(error.message, 'ollama', error.code)
        }
    }

    async stream(messages, callback, options = {}) {
        try {
            const stream = await ollama.chat({
                model: options.model || 'llama2',
                messages,
                stream: true,
                ...options
            }, { baseUrl: this.baseUrl })

            for await (const chunk of stream) {
                const content = chunk.message?.content || ''
                if (content) callback(content)
            }
        } catch (error) {
            throw new APIError(error.message, 'ollama', error.code)
        }
    }
}

export default Ollama