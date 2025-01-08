// src/factory.js
import { OpenAIClient } from './providers/openai.js';
import { ClaudeClient } from './providers/claude.js';
import { OllamaClient } from './providers/ollama.js';
import { MistralClient } from './providers/mistral.js';
import { GroqClient } from './providers/groq.js';
import { PerplexityClient } from './providers/perplexity.js';
import { HuggingFaceClient } from './providers/huggingface.js';
import { MCPClient } from './mcp/mcp-client.js';
import { KeyManager } from './utils/key-manager.js';

const PROVIDERS = {
    openai: OpenAIClient,
    claude: ClaudeClient,
    ollama: OllamaClient,
    mistral: MistralClient,
    groq: GroqClient,
    perplexity: PerplexityClient,
    huggingface: HuggingFaceClient
};

export async function createAIClient(provider, config = {}) {
    const ClientClass = PROVIDERS[provider.toLowerCase()];
    if (!ClientClass) {
        throw new Error(`Unknown AI provider: ${provider}`);
    }

    // Validate and get API key
    const key = KeyManager.getKey(config, provider);

    // Create base client
    const client = new ClientClass({ ...config, apiKey: key });

    // Wrap with MCP if requested
    if (config.mcp) {
        const mcpClient = new MCPClient(config.mcp);
        
        // Register MCP resources if provided
        if (config.mcp.resources) {
            for (const [id, resource] of Object.entries(config.mcp.resources)) {
                await mcpClient.registerResource(id, resource);
            }
        }

        // Register MCP tools if provided
        if (config.mcp.tools) {
            for (const [id, tool] of Object.entries(config.mcp.tools)) {
                await mcpClient.registerTool(id, tool);
            }
        }

        // Register MCP prompts if provided
        if (config.mcp.prompts) {
            for (const [id, prompt] of Object.entries(config.mcp.prompts)) {
                await mcpClient.registerPrompt(id, prompt);
            }
        }

        // Extend client with MCP capabilities
        return new Proxy(client, {
            get(target, prop) {
                if (prop in mcpClient) {
                    return mcpClient[prop].bind(mcpClient);
                }
                return target[prop];
            }
        });
    }

    return client;
}