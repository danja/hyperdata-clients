import EmbeddingClient from '../common/EmbeddingClient.js'
import APIError from '../common/APIError.js'

export class NomicEmbeddingClient extends EmbeddingClient {
    constructor(config = {}) {
        super(config)
        const apiKey = config.apiKey || process.env.NOMIC_API_KEY

        if (!apiKey) {
            throw new Error('Nomic API key is required. Provide it in constructor or set NOMIC_API_KEY environment variable.')
        }

        this.apiKey = apiKey
        this.baseUrl = config.baseUrl || 'https://api-atlas.nomic.ai/v1'
    }

    async embed(texts, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/embedding/text`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: options.model || 'nomic-embed-text-v1.5',
                    texts: Array.isArray(texts) ? texts : [texts],
                    ...options
                })
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`HTTP ${response.status}: ${errorText}`)
            }

            const data = await response.json()
            return data.embeddings || data.data || []
        } catch (error) {
            throw new APIError(error.message, 'nomic', error.status)
        }
    }
}

export default NomicEmbeddingClient