// spec/integration/mcp-persistence.spec.js
import { expect } from 'chai';
import { createAIClient } from '../../src/factory.js';
import fs from 'fs/promises';
import path from 'path';

describe('MCP State Persistence', () => {
    const stateFile = path.join(process.cwd(), 'mcp-state.json');
    let client;

    const persistState = async (state) => {
        await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
    };

    const loadState = async () => {
        const data = await fs.readFile(stateFile, 'utf-8');
        return JSON.parse(data);
    };

    beforeEach(async () => {
        // Initial state
        const initialState = {
            resources: {
                'persisted-doc': {
                    uri: 'mcp:test',
                    mimeType: 'text/plain',
                    content: 'Persisted content'
                }
            },
            tools: {
                'persisted-tool': {
                    name: 'Persisted Tool',
                    description: 'A tool that persists',
                    results: []
                }
            }
        };
        await persistState(initialState);

        client = await createAIClient('openai', {
            apiKey: process.env.OPENAI_API_KEY,
            mcp: {
                stateFile,
                onStateChange: async (newState) => {
                    await persistState(newState);
                }
            }
        });
    });

    afterEach(async () => {
        try {
            await fs.unlink(stateFile);
        } catch (err) {
            // Ignore if file doesn't exist
        }
    });

    it('should load persisted resources', async () => {
        const resource = await client.getResource('persisted-doc');
        expect(resource.uri).to.equal('mcp:test');
        expect(resource.content).to.equal('Persisted content');
    });

    it('should persist new resources', async () => {
        await client.registerResource('new-doc', {
            uri: 'mcp:new',
            content: 'New content'
        });

        const state = await loadState();
        expect(state.resources['new-doc']).to.exist;
        expect(state.resources['new-doc'].content).to.equal('New content');
    });

    it('should track tool execution history', async () => {
        const toolState = {
            name: 'History Tool',
            description: 'Tracks execution history',
            execute: async (args) => {
                const state = await loadState();
                const tool = state.tools['history-tool'];
                tool.results.push(args);
                await persistState(state);
                return args.value * 2;
            },
            results: []
        };

        await client.registerTool('history-tool', toolState);
        await client.executeTool('history-tool', { value: 5 });

        const state = await loadState();
        expect(state.tools['history-tool'].results).to.have.lengthOf(1);
        expect(state.tools['history-tool'].results[0].value).to.equal(5);
    });

    it('should restore complete MCP state on restart', async () => {
        // Register new items
        await client.registerResource('test1', { uri: 'mcp:test1' });
        await client.registerTool('tool1', { name: 'Tool 1' });
        await client.registerPrompt('prompt1', { name: 'Prompt 1' });

        // Create new client instance
        const newClient = await createAIClient('openai', {
            apiKey: process.env.OPENAI_API_KEY,
            mcp: { stateFile }
        });

        const description = newClient.describe();
        expect(description.resources).to.have.lengthOf(2); // includes persisted-doc
        expect(description.tools).to.have.lengthOf(2);     // includes persisted-tool
        expect(description.prompts).to.have.lengthOf(1);
    });
});
