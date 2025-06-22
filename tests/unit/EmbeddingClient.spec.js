import { describe, it, expect, beforeEach } from 'vitest'
import EmbeddingClient from '../../src/common/EmbeddingClient.js'

describe('EmbeddingClient', () => {
    class TestEmbeddingClient extends EmbeddingClient {
        async embed(texts, options) { 
            return texts.map(text => [0.1, 0.2, 0.3])
        }
    }

    it('should not allow instantiation of abstract class', () => {
        expect(() => new EmbeddingClient()).toThrow('Cannot instantiate abstract class')
    })

    it('should store configuration', () => {
        const config = { apiKey: 'test-key', model: 'test-model' }
        const client = new TestEmbeddingClient(config)
        expect(client.config).toEqual(config)
    })

    it('should require embed method implementation', async () => {
        class IncompleteClient extends EmbeddingClient {}
        const client = new IncompleteClient()
        
        await expect(client.embed(['test'])).rejects.toThrow('Method embed() must be implemented')
    })

    it('should implement embedSingle convenience method', async () => {
        const client = new TestEmbeddingClient()
        const result = await client.embedSingle('test text')
        
        expect(result).toEqual([0.1, 0.2, 0.3])
    })

    describe('TestEmbeddingClient implementation', () => {
        let client

        beforeEach(() => {
            client = new TestEmbeddingClient()
        })

        it('should handle single text embedding', async () => {
            const result = await client.embed(['hello world'])
            expect(result).toEqual([[0.1, 0.2, 0.3]])
        })

        it('should handle multiple text embeddings', async () => {
            const result = await client.embed(['hello', 'world'])
            expect(result).toEqual([[0.1, 0.2, 0.3], [0.1, 0.2, 0.3]])
        })
    })
})