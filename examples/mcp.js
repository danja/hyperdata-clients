const client = await createAPIClient('openai', {
    mcp: {
        resources: {
            'docs': {
                uri: 'file://docs/',
                mimeType: 'text/markdown'
            }
        },
        tools: {
            'search': {
                name: 'Search Documentation',
                description: 'Search through documentation',
                execute: async (query) => { /* ... */ }
            }
        },
        prompts: {
            'summarize': {
                name: 'Summarize Text',
                template: (context) => `Summarize: ${context.text}`
            }
        }
    }
})

// Use MCP features
const resource = await client.getResource('docs')
const result = await client.executeTool('search', { query: 'api' })
const prompt = await client.renderPrompt('summarize', { text: 'content' })