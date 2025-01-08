// spec/mcp/mcp-client.spec.js
import { expect } from 'chai';
import { MCPClient } from '../../src/mcp/mcp-client.js';
import { AIError } from '../../src/base-client.js';

describe('MCP Client', () => {
    let client;

    beforeEach(() => {
        client = new MCPClient();
    });

    describe('Resource Management', () => {
        it('should register and retrieve resources', async () => {
            await client.registerResource('test', {
                uri: 'mcp:test',
                mimeType: 'text/plain'
            });

            const resource = await client.getResource('test');
            expect(resource.uri).to.equal('mcp:test');
            expect(resource.mimeType).to.equal('text/plain');
        });

        it('should generate default URI if not provided', async () => {
            await client.registerResource('test', {});
            const resource = await client.getResource('test');
            expect(resource.uri).to.equal('mcp:resource:test');
        });

        it('should throw on missing resource', async () => {
            await expect(client.getResource('nonexistent'))
                .to.be.rejectedWith(AIError)
                .and.have.property('code', 'RESOURCE_NOT_FOUND');
        });
    });

    describe('Tool Management', () => {
        it('should register and execute tools', async () => {
            const tool = {
                name: 'Test Tool',
                description: 'A test tool',
                execute: async (args) => args.value * 2
            };

            await client.registerTool('multiply', tool);
            const result = await client.executeTool('multiply', { value: 5 });
            expect(result).to.equal(10);
        });

        it('should throw on non-executable tool', async () => {
            await client.registerTool('broken', { name: 'Broken Tool' });
            await expect(client.executeTool('broken'))
                .to.be.rejectedWith(AIError)
                .and.have.property('code', 'TOOL_NOT_EXECUTABLE');
        });
    });

    describe('Prompt Management', () => {
        it('should register and render prompts', async () => {
            const prompt = {
                name: 'Test Prompt',
                template: (ctx) => `Hello ${ctx.name}!`
            };

            await client.registerPrompt('greeting', prompt);
            const result = await client.renderPrompt('greeting', { name: 'World' });
            expect(result).to.equal('Hello World!');
        });

        it('should throw on invalid prompt', async () => {
            await client.registerPrompt('invalid', { name: 'Invalid Prompt' });
            await expect(client.renderPrompt('invalid'))
                .to.be.rejectedWith(AIError)
                .and.have.property('code', 'INVALID_PROMPT');
        });
    });

    describe('MCP Description', () => {
        it('should describe all registered capabilities', async () => {
            await client.registerResource('res1', { mimeType: 'text/plain' });
            await client.registerTool('tool1', { name: 'Tool 1', description: 'Test tool' });
            await client.registerPrompt('prompt1', { name: 'Prompt 1', description: 'Test prompt' });

            const description = client.describe();
            
            expect(description.resources).to.have.lengthOf(1);
            expect(description.tools).to.have.lengthOf(1);
            expect(description.prompts).to.have.lengthOf(1);
            
            expect(description.resources[0].id).to.equal('res1');
            expect(description.tools[0].name).to.equal('Tool 1');
            expect(description.prompts[0].name).to.equal('Prompt 1');
        });
    });
});
