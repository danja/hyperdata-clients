// spec/integration/mcp-integration.spec.js
import { expect } from 'chai'
import { createAIClient } from '../../src/common/ClientFactory.js'
import fs from 'fs/promises'
import path from 'path'

describe('MCP Integration Tests', () => {
    let client
    let testDir

    before(async () => {
        // Create test resources directory
        testDir = path.join(process.cwd(), 'test-resources')
        await fs.mkdir(testDir, { recursive: true })
        await fs.writeFile(
            path.join(testDir, 'test.txt'),
            'This is a test document for MCP integration.'
        )

        client = await createAIClient('openai', {
            apiKey: process.env.OPENAI_API_KEY,
            mcp: {
                resources: {
                    'test-doc': {
                        uri: `file://${path.join(testDir, 'test.txt')}`,
                        mimeType: 'text/plain'
                    }
                },
                tools: {
                    'file-reader': {
                        name: 'File Reader',
                        description: 'Reads file content',
                        execute: async (args) => {
                            const content = await fs.readFile(args.path, 'utf-8')
                            return content
                        }
                    }
                },
                prompts: {
                    'summarize': {
                        name: 'Summarize',
                        template: (ctx) => `Summarize the following text:\n\n${ctx.text}`
                    }
                }
            }
        })
    })

    after(async () => {
        await fs.rm(testDir, { recursive: true })
    })

    it('should read and process real file resources', async () => {
        const resource = await client.getResource('test-doc')
        expect(resource.uri).to.include('test.txt')

        const content = await client.executeTool('file-reader', {
            path: resource.uri.replace('file://', '')
        })
        expect(content).to.include('test document')
    })

    it('should use MCP-enhanced chat completion', async () => {
        const resource = await client.getResource('test-doc')
        const content = await client.executeTool('file-reader', {
            path: resource.uri.replace('file://', '')
        })

        const prompt = await client.renderPrompt('summarize', { text: content })
        const summary = await client.chat([{
            role: 'user',
            content: prompt
        }])

        expect(summary).to.be.a('string')
        expect(summary.length).to.be.greaterThan(0)
    })
})
