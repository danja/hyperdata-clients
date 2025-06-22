import ollama from 'ollama'
import EmbeddingClient from '../common/EmbeddingClient.js'
import APIError from '../common/APIError.js'

export class OllamaEmbeddingClient extends EmbeddingClient {
    constructor(config = {}) {
        super(config)
        this.baseUrl = config.baseUrl || process.env.OLLAMA_HOST || 'http://localhost:11434'
    }

    async embed(texts, options = {}) {
        try {
            const textArray = Array.isArray(texts) ? texts : [texts]
            const embeddings = []

            for (const text of textArray) {
                const response = await ollama.embeddings({
                    model: options.model || 'nomic-embed-text-v1.5',
                    prompt: text,
                    ...options
                }, { baseUrl: this.baseUrl })
                
                embeddings.push(response.embedding)
            }

            return embeddings
        } catch (error) {
            throw new APIError(error.message, 'ollama-embedding', error.code)
        }
    }
}

export default OllamaEmbeddingClient