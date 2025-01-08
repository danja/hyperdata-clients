// factory.js
import { OpenAIClient } from './providers/openai.js';
import { ClaudeClient } from './providers/claude.js';
import { OllamaClient } from './providers/ollama.js';
import { MistralClient } from './providers/mistral.js';
import { GroqClient } from './providers/groq.js';
import { PerplexityClient } from './providers/perplexity.js';
import { HuggingFaceClient } from './providers/huggingface.js';

const PROVIDERS = {
    openai: OpenAIClient,
    claude: ClaudeClient,
    ollama: OllamaClient,
    mistral: MistralClient,
    groq: GroqClient,
    perplexity: PerplexityClient,
    huggingface: HuggingFaceClient
};

export function createAIClient(provider, config) {
    const ClientClass = PROVIDERS[provider.toLowerCase()];
    if (!ClientClass) {
        throw new Error(`Unknown AI provider: ${provider}`);
    }
    return new ClientClass(config);
}
