
import OpenAIClient from '../providers/OpenAI.js'
import Claude from '../providers/Claude.js'
import Ollama from '../providers/Ollama.js'
import Mistral from '../providers/Mistral.js'
import Groqq from '../providers/Groqq.js'
import Perplexity from '../providers/Perplexity.js'
import HuggingFace from '../providers/HuggingFace.js'
import MCPClient from '../providers/MCP.js'
import KeyManager from '../common/KeyManager.js'

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

    static async createAPIClient(provider, config = {}) {
        const ClientClass = ClientFactory.PROVIDERS[provider.toLowerCase()]
        if (!ClientClass) {
            throw new Error(`Unknown AI provider: ${provider}`)
        }

        // Validate and get API key
        const key = KeyManager.getKey(config, provider)

        // Create base client
        const client = new ClientClass({ ...config, apiKey: key })

        // Wrap with MCP if requested
        if (config.mcp) {
            return ClientFactory.createMCPClient(config.mcp)
        }
        return client
    }


    static async createMCPClient(mcpConfig) {
        const mcpClient = new MCPClient(mcpConfig)

        // Register MCP resources if provided
        if (mcpConfig.resources) {
            for (const [id, resource] of Object.entries(mcpConfig.resources)) {
                await mcpClient.registerResource(id, resource)
            }
        }

        // Register MCP tools if provided
        if (mcpConfig.tools) {
            for (const [id, tool] of Object.entries(mcpConfig.tools)) {
                await mcpClient.registerTool(id, tool)
            }
        }

        // Register MCP prompts if provided
        if (mcpConfig.prompts) {
            for (const [id, prompt] of Object.entries(mcpConfig.prompts)) {
                await mcpClient.registerPrompt(id, prompt)
            }
        }

        // Extend client with MCP capabilities
        return new Proxy(client, {
            get(target, prop) {
                if (prop in mcpClient) {
                    return mcpClient[prop].bind(mcpClient)
                }
                return target[prop]
            }
        })
    }
}

export default ClientFactory