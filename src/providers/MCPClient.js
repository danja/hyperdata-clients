import { AIClient, AIError } from '../common/AIClient.js'

export default class MCPClient extends AIClient {
    constructor(config = {}) {
        super(config)
        this.resources = new Map()
        this.tools = new Map()
        this.prompts = new Map()
    }

    async registerResource(id, resource) {
        this.resources.set(id, {
            ...resource,
            uri: resource.uri || `mcp:resource:${id}`,
            mimeType: resource.mimeType || 'text/plain'
        })
    }

    async registerTool(id, tool) {
        this.tools.set(id, {
            ...tool,
            name: tool.name || id,
            description: tool.description || ''
        })
    }

    async registerPrompt(id, prompt) {
        this.prompts.set(id, {
            ...prompt,
            name: prompt.name || id,
            description: prompt.description || ''
        })
    }

    async getResource(id) {
        const resource = this.resources.get(id)
        if (!resource) throw new AIError(`Resource not found: ${id}`, 'mcp', 'RESOURCE_NOT_FOUND')
        return resource
    }

    async executeTool(id, args) {
        const tool = this.tools.get(id)
        if (!tool) throw new AIError(`Tool not found: ${id}`, 'mcp', 'TOOL_NOT_FOUND')
        if (!tool.execute) throw new AIError(`Tool not executable: ${id}`, 'mcp', 'TOOL_NOT_EXECUTABLE')
        return tool.execute(args)
    }

    async renderPrompt(id, context) {
        const prompt = this.prompts.get(id)
        if (!prompt) throw new AIError(`Prompt not found: ${id}`, 'mcp', 'PROMPT_NOT_FOUND')
        if (!prompt.template) throw new AIError(`Invalid prompt template: ${id}`, 'mcp', 'INVALID_PROMPT')
        return prompt.template(context)
    }

    describe() {
        return {
            resources: Array.from(this.resources.entries()).map(([id, r]) => ({
                id,
                uri: r.uri,
                mimeType: r.mimeType
            })),
            tools: Array.from(this.tools.entries()).map(([id, t]) => ({
                id,
                name: t.name,
                description: t.description
            })),
            prompts: Array.from(this.prompts.entries()).map(([id, p]) => ({
                id,
                name: p.name,
                description: p.description
            }))
        }
    }
}