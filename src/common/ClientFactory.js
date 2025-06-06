import OpenAIClient from '../providers/OpenAI.js'
import Claude from '../providers/Claude.js'
import Ollama from '../providers/Ollama.js'
import Mistral from '../providers/Mistral.js'
import Groqq from '../providers/Groqq.js'
import Perplexity from '../providers/Perplexity.js'
import HuggingFace from '../providers/HuggingFace.js'
import MCPClient from '../providers/MCP.js'
import KeyManager from '../common/KeyManager.js'
import dotenv from 'dotenv'

// Ensure environment variables are loaded first
dotenv.config()

class ClientFactory {
    static PROVIDERS = {
        openai: OpenAIClient,
        claude: Claude,
        ollama: Ollama,
        mistral: Mistral,
        groq: Groqq,
        perplexity: Perplexity,
        huggingface: HuggingFace
    }

    static async createClient(provider, config = {}) {
        if (provider === 'mcp') {
            return this.createMCPClient(config)
        } else {
            return this.createAPIClient(provider, config)
        }
    }

    static async createAPIClient(provider, config = {}) {
        const normalizedProvider = provider.toLowerCase()
        const ClientClass = ClientFactory.PROVIDERS[normalizedProvider]
        if (!ClientClass) {
            throw new Error(`Unknown AI provider: ${provider}`)
        }

        // Check required methods exist on the prototype
        if (typeof ClientClass.prototype.chat !== 'function') {
            throw new Error(`The client for provider ${provider} does not implement the required 'chat' method`)
        }

        // Validate and get API key
        const key = KeyManager.getKey(config, normalizedProvider)

        // Create client instance
        const client = new ClientClass({ ...config, apiKey: key })
        return client
    }

    static async createMCPClient(mcpConfig) {
        if (!mcpConfig) {
            throw new Error('MCP configuration is required')
        }

        // Validate and get MCP key
        const key = KeyManager.getKey(mcpConfig, 'mcp')

        // Create MCP client with validated key
        const client = new MCPClient({
            ...mcpConfig,
            apiKey: key
        })

        return client
    }
}

export default ClientFactory