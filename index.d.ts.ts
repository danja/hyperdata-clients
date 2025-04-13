// index.d.ts
export interface AIConfig {
    apiKey?: string;
    clientOptions?: Record<string, any>;
    mcp?: MCPConfig;
}

export interface MCPConfig {
    resources?: Record<string, MCPResource>;
    tools?: Record<string, MCPTool>;
    prompts?: Record<string, MCPPrompt>;
    stateFile?: string;
    onStateChange?: (state: MCPState) => Promise<void>;
}

export interface MCPResource {
    uri?: string;
    mimeType?: string;
    [key: string]: any;
}

export interface MCPTool {
    name: string;
    description?: string;
    execute: (args: Record<string, any>) => Promise<any>;
}

export interface MCPPrompt {
    name: string;
    description?: string;
    template: (context: Record<string, any>) => string;
}

export interface MCPState {
    resources: Record<string, MCPResource>;
    tools: Record<string, MCPTool>;
    prompts: Record<string, MCPPrompt>;
}

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export class APIError extends Error {
    constructor(message: string, provider: string, code: string);
    provider: string;
    code: string;
}