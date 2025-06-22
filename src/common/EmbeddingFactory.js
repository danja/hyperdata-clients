import NomicEmbeddingClient from '../providers/NomicEmbedding.js'
import OllamaEmbeddingClient from '../providers/OllamaEmbedding.js'
import KeyManager from '../common/KeyManager.js'
import dotenv from 'dotenv'

// Ensure environment variables are loaded first
dotenv.config()

class EmbeddingFactory {
    static PROVIDERS = {
        nomic: NomicEmbeddingClient,
        ollama: OllamaEmbeddingClient
    }

    static async createEmbeddingClient(provider, config = {}) {
        const normalizedProvider = provider.toLowerCase()
        const ClientClass = EmbeddingFactory.PROVIDERS[normalizedProvider]
        
        if (!ClientClass) {
            throw new Error(`Unknown embedding provider: ${provider}`)
        }

        // Check required methods exist on the prototype
        if (typeof ClientClass.prototype.embed !== 'function') {
            throw new Error(`The embedding client for provider ${provider} does not implement the required 'embed' method`)
        }

        // For Ollama, no API key is required
        if (normalizedProvider === 'ollama') {
            return new ClientClass(config)
        }

        // For other providers, validate and get API key
        const key = KeyManager.getKey(config, normalizedProvider)
        const client = new ClientClass({ ...config, apiKey: key })
        
        return client
    }
}

export default EmbeddingFactory