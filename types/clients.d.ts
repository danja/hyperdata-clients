// clients.d.ts
import { AIConfig, Message, MCPResource, MCPTool, MCPPrompt, MCPState } from './index';

declare class ClientFactory {
    static createClient(provider: string, config?: AIConfig): Promise<APIClient>;
    static createAPIClient(provider: string, config?: AIConfig): Promise<APIClient>;
}

export abstract class APIClient {
    constructor(config?: AIConfig);
    abstract chat(messages: Message[], options?: Record<string, any>): Promise<string>;
    abstract complete(prompt: string, options?: Record<string, any>): Promise<string>;
    abstract embedding(text: string | string[], options?: Record<string, any>): Promise<number[]>;
    abstract stream(messages: Message[], callback: (chunk: string) => void, options?: Record<string, any>): Promise<void>;
}

export class MCPClient extends APIClient {
    registerResource(id: string, resource: MCPResource): Promise<void>;
    registerTool(id: string, tool: MCPTool): Promise<void>;
    registerPrompt(id: string, prompt: MCPPrompt): Promise<void>;
    getResource(id: string): Promise<MCPResource>;
    executeTool(id: string, args: Record<string, any>): Promise<any>;
    renderPrompt(id: string, context: Record<string, any>): Promise<string>;
    describe(): MCPState;
}

export function createAPIClient(
    provider: string,
    config?: AIConfig
): Promise<APIClient & Partial<MCPClient>>;

export function createClient(
    provider: string,
    config?: AIConfig
): Promise<APIClient | MCPClient>;

// Provider-specific types
export interface OpenAIOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    [key: string]: any;
}

export interface MistralOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    [key: string]: any;
}

export interface OllamaOptions {
    model?: string;
    parameters?: {
        temperature?: number;
        num_ctx?: number;
        [key: string]: any;
    };
}

export interface ProviderConfig extends AIConfig {
    provider?: string;
    apiKey?: string;
    [key: string]: any;
}