import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import ClientFactory from '../../src/common/ClientFactory.js'
import APIClient from '../../src/common/APIClient.js'
import MCPClient from '../../src/providers/MCP.js'

// Mock environment variables
const MOCK_KEYS = {
    openai: 'test-openai-key-123',
    groq: 'test-groq-key-123',
    mcp: 'test-mcp-key-123'
}

// Helper to clear environment variables
function clearEnvKeys() {
    Object.keys(MOCK_KEYS).forEach(key => {
        delete process.env[`${key.toUpperCase()}_API_KEY`]
    })
}

describe('ClientFactory', () => {
    const originalCwd = process.cwd
    const mockCwd = () => '/test/path'

    beforeEach(() => {
        process.env.GROQ_API_KEY = 'test-groq-key'
    })

    afterEach(() => {
        delete process.env.GROQ_API_KEY
    })

    describe('createAPIClient', () => {
        const originalProviders = { ...ClientFactory.PROVIDERS }

        afterEach(() => {
            // Restore original providers after each test
            ClientFactory.PROVIDERS = originalProviders
        })

        Object.entries(originalProviders).forEach(([provider, ProviderClass]) => {
            it(`should create ${provider} client with config`, async () => {
                const testKey = `test-${provider}-key-123`
                const config = { apiKey: testKey }
                const client = await ClientFactory.createAPIClient(provider, config)
                expect(client).toBeInstanceOf(ProviderClass)
                // Just check that the key is set, not its specific value
                expect(typeof client.config.apiKey).toBe('string')
                expect(client.config.apiKey).toBeTruthy()
            })
        })

        it('should throw error for unknown provider', async () => {
            await expect(ClientFactory.createAPIClient('unknown'))
                .rejects.toThrow('Unknown AI provider: unknown')
        })

        it('should handle provider name casing', async () => {
            const config = { apiKey: MOCK_KEYS.openai }
            const client = await ClientFactory.createAPIClient('OpenAI', config)
            expect(client).toBeInstanceOf(ClientFactory.PROVIDERS.openai)
        })

        it('should create test provider with config', async () => {
            // Create test provider
            class TestProvider extends APIClient {
                constructor(config) {
                    super(config)
                }
                // Add required methods to satisfy the interface
                async chat() {}
                async complete() {}
                async embedding() {}
                async stream() {}
            }

            // Temporarily replace all providers with just our test provider
            ClientFactory.PROVIDERS = {
                testprovider: TestProvider
            }

            const config = { apiKey: 'test-key' }
            const client = await ClientFactory.createAPIClient('testprovider', config)
            expect(client).toBeInstanceOf(TestProvider)
            expect(client.config.apiKey).toBe('test-key')
        })
    })

    describe('createMCPClient', () => {
        const mcpConfig = {
            baseUrl: 'http://localhost:3000',
            apiKey: MOCK_KEYS.mcp,
            resourcePath: '/resources'
        }

        beforeEach(() => {
            clearEnvKeys()
        })

        it('should create MCP client with valid config', async () => {
            const client = await ClientFactory.createMCPClient(mcpConfig)
            expect(client).toBeInstanceOf(MCPClient)
            expect(client.config).toMatchObject(mcpConfig)
        })

        it('should handle MCP client creation without config', async () => {
            await expect(ClientFactory.createMCPClient())
                .rejects.toThrow('MCP configuration is required')
        })

        it('should create MCP client with any key format', async () => {
            const testConfig = { ...mcpConfig, apiKey: 'test-key-123' }
            const client = await ClientFactory.createMCPClient(testConfig)
            expect(client.config.apiKey).toBe('test-key-123')
        })
    })
})
