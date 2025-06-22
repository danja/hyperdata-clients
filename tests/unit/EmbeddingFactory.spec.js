import { describe, it, expect, beforeEach, vi } from 'vitest'
import EmbeddingFactory from '../../src/common/EmbeddingFactory.js'
import NomicEmbeddingClient from '../../src/providers/NomicEmbedding.js'
import OllamaEmbeddingClient from '../../src/providers/OllamaEmbedding.js'

// Mock KeyManager
vi.mock('../../src/common/KeyManager.js', () => ({
    default: {
        getKey: vi.fn((config, provider) => {
            if (provider === 'nomic') return 'nomic-test-key'
            return 'test-key'
        })
    }
}))

describe('EmbeddingFactory', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should create nomic embedding client', async () => {
        const client = await EmbeddingFactory.createEmbeddingClient('nomic')
        expect(client).toBeInstanceOf(NomicEmbeddingClient)
    })

    it('should create ollama embedding client', async () => {
        const client = await EmbeddingFactory.createEmbeddingClient('ollama')
        expect(client).toBeInstanceOf(OllamaEmbeddingClient)
    })

    it('should handle case insensitive provider names', async () => {
        const client = await EmbeddingFactory.createEmbeddingClient('NOMIC')
        expect(client).toBeInstanceOf(NomicEmbeddingClient)
    })

    it('should throw error for unknown provider', async () => {
        await expect(EmbeddingFactory.createEmbeddingClient('unknown'))
            .rejects.toThrow('Unknown embedding provider: unknown')
    })

    it('should pass configuration to client', async () => {
        const config = { model: 'custom-model' }
        const client = await EmbeddingFactory.createEmbeddingClient('ollama', config)
        expect(client.config.model).toBe('custom-model')
    })

    it('should validate client has required methods', async () => {
        // Mock a provider without embed method
        const InvalidProvider = class {}
        EmbeddingFactory.PROVIDERS.invalid = InvalidProvider

        await expect(EmbeddingFactory.createEmbeddingClient('invalid'))
            .rejects.toThrow('does not implement the required \'embed\' method')
        
        // Clean up
        delete EmbeddingFactory.PROVIDERS.invalid
    })
})