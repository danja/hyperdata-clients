// clients.d.ts
import { AIConfig, Message, MCPResource, MCPTool, MCPPrompt, MCPState } from './index';

export abstract class AIClient {
    constructor(config?: AIConfig);
    abstract chat(messages: Message[], options?: Record<string, any>): Promise<string>;
    abstract complete(prompt: string, options?: Record<string, any>): Promise<string>;
    abstract embedding(text: string | string[], options?: Record<string, any>): Promise<number[]>;
    abstract stream(messages: Message[], callback: (chunk: string) => void, options?: Record<string, any>): Promise<void>;
}

export class MCPClient extends AIClient {
    registerResource(id: string, resource: MCPResource): Promise<void>;
    registerTool(id: string, tool: MCPTool): Promise<void>;
    registerPrompt(id: string, prompt: MCPPrompt): Promise<void>;
    getResource(id: string): Promise<MCPResource>;
    executeTool(id: string, args: Record<string, any>): Promise<any>;
    renderPrompt(id: string, context: Record<string, any>): Promise<string>;
    describe(): MCPState;
}

export function createAIClient(
    provider: string,
    config?: AIConfig
): Promise<AIClient & Partial<MCPClient>>;

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