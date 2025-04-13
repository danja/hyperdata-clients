// spec/mcp/factory-mcp.spec.js
import { expect } from 'chai'
import { createAPIClient } from '../../src/factory.js'

describe('MCP Factory Integration', () => {
    it('should create MCP-enabled client', async () => {
        const client = await createAPIClient('openai', {
            apiKey: 'test-key',
            mcp: {
                resources: {
                    'test': {
                        uri: 'mcp:test',
                        mimeType: 'text/plain'
                    }
                }
            }
        })

        expect(client.getResource).to.be.a('function')
        expect(client.executeTool).to.be.a('function')
        expect(client.renderPrompt).to.be.a('function')

        const resource = await client.getResource('test')
        expect(resource.uri).to.equal('mcp:test')
    })

    it('should handle MCP tools with provider methods', async () => {
        const mockTool = {
            name: 'Test Tool',
            execute: async () => 'tool result'
        }

        const client = await createAPIClient('openai', {
            apiKey: 'test-key',
            mcp: {
                tools: {
                    'test': mockTool
                }
            }
        })

        client.chat = async () => 'chat result'

        // Should have both MCP and provider methods
        const toolResult = await client.executeTool('test')
        const chatResult = await client.chat([])

        expect(toolResult).to.equal('tool result')
        expect(chatResult).to.equal('chat result')
    })

    it('should initialize all provided MCP features', async () => {
        const config = {
            apiKey: 'test-key',
            mcp: {
                resources: {
                    'res1': { uri: 'mcp:res1' }
                },
                tools: {
                    'tool1': {
                        name: 'Tool 1',
                        execute: async () => 'result'
                    }
                },
                prompts: {
                    'prompt1': {
                        name: 'Prompt 1',
                        template: (ctx) => `Test ${ctx.value}`
                    }
                }
            }
        }

        const client = await createAPIClient('openai', config)
        const description = client.describe()

        expect(description.resources).to.have.lengthOf(1)
        expect(description.tools).to.have.lengthOf(1)
        expect(description.prompts).to.have.lengthOf(1)

        const promptResult = await client.renderPrompt('prompt1', { value: 'works' })
        expect(promptResult).to.equal('Test works')
    })

    it('should create normal client when MCP not requested', async () => {
        const client = await createAPIClient('openai', {
            apiKey: 'test-key'
        })

        expect(client.getResource).to.be.undefined
        expect(client.describe).to.be.undefined
    })
})
