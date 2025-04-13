import { expect, MOCK_KEYS, clearEnvKeys } from '../helpers/testHelper.js'
import ClientFactory from '../../src/common/ClientFactory.js'
import APIClient from '../../src/common/APIClient.js'
import MCPClient from '../../src/providers/MCP.js'

describe('ClientFactory', () => {
    const originalCwd = process.cwd
    const mockCwd = () => '/test/path'

    beforeEach(() => {
        clearEnvKeys()
        process.cwd = mockCwd
    })

    afterEach(() => {
        process.cwd = originalCwd
    })

    describe('createAPIClient', () => {
        const originalProviders = { ...ClientFactory.PROVIDERS }

        afterEach(() => {
            // Restore original providers after each test
            ClientFactory.PROVIDERS = originalProviders
        })

        Object.entries(originalProviders).forEach(([provider, ProviderClass]) => {
            it(`should create ${provider} client with valid config`, async () => {
                const config = { apiKey: MOCK_KEYS[provider] }
                const client = await ClientFactory.createAPIClient(provider, config)
                expect(client).to.be.instanceOf(ProviderClass)
                expect(client.config.apiKey).to.equal(MOCK_KEYS[provider])
            })
        })

        it('should throw error for unknown provider', async () => {
            await expect(ClientFactory.createAPIClient('unknown'))
                .to.be.rejectedWith('Unknown AI provider: unknown')
        })

        it('should handle provider name casing', async () => {
            const config = { apiKey: MOCK_KEYS.openai }
            const client = await ClientFactory.createAPIClient('OpenAI', config)
            expect(client).to.be.instanceOf(ClientFactory.PROVIDERS.openai)
        })

        it('should throw error if required methods are missing', async () => {
            // Create test provider without required methods
            class TestProvider extends APIClient {
                constructor(config) {
                    super(config)
                }
                // Deliberately not implementing required methods
            }

            // Temporarily replace all providers with just our test provider
            ClientFactory.PROVIDERS = {
                testprovider: TestProvider
            }

            // This should fail due to missing chat method
            await expect(ClientFactory.createAPIClient('testProvider', { apiKey: 'test-key' }))
                .to.be.rejectedWith('The client for provider testProvider does not implement the required \'chat\' method')
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
            expect(client).to.be.instanceOf(MCPClient)
            expect(client.config).to.deep.include(mcpConfig)
        })

        it('should handle MCP client creation without config', async () => {
            await expect(ClientFactory.createMCPClient())
                .to.be.rejectedWith('MCP configuration is required')
        })

        it('should validate MCP key format', async () => {
            const invalidConfig = { ...mcpConfig, apiKey: 'invalid-key' }
            await expect(ClientFactory.createMCPClient(invalidConfig))
                .to.be.rejectedWith('Invalid mcp API key format')
        })
    })
})
