import { describe, it, expect, beforeEach, vi } from 'vitest'
import OllamaEmbeddingClient from '../../../src/providers/OllamaEmbedding.js'
import APIError from '../../../src/common/APIError.js'

// Mock ollama module
vi.mock('ollama', () => ({
    default: {
        embeddings: vi.fn()
    }
}))

import ollama from 'ollama'

describe('OllamaEmbeddingClient', () => {
    let client

    beforeEach(() => {
        vi.clearAllMocks()
        client = new OllamaEmbeddingClient()
    })

    it('should use default base URL', () => {
        expect(client.baseUrl).toBe('http://localhost:11434')
    })

    it('should use custom base URL from config', () => {
        const customClient = new OllamaEmbeddingClient({ 
            baseUrl: 'http://custom-ollama:11434' 
        })
        expect(customClient.baseUrl).toBe('http://custom-ollama:11434')
    })

    it('should use environment variable for base URL', () => {
        process.env.OLLAMA_HOST = 'http://env-ollama:11434'
        const envClient = new OllamaEmbeddingClient()
        expect(envClient.baseUrl).toBe('http://env-ollama:11434')
        delete process.env.OLLAMA_HOST
    })

    it('should embed single text successfully', async () => {
        ollama.embeddings.mockResolvedValue({
            embedding: [0.1, 0.2, 0.3]
        })

        const result = await client.embed(['hello world'])
        
        expect(ollama.embeddings).toHaveBeenCalledWith(
            {
                model: 'nomic-embed-text-v1.5',
                prompt: 'hello world'
            },
            { baseUrl: 'http://localhost:11434' }
        )
        expect(result).toEqual([[0.1, 0.2, 0.3]])
    })

    it('should embed multiple texts successfully', async () => {
        ollama.embeddings
            .mockResolvedValueOnce({ embedding: [0.1, 0.2, 0.3] })
            .mockResolvedValueOnce({ embedding: [0.4, 0.5, 0.6] })

        const result = await client.embed(['hello', 'world'])
        
        expect(ollama.embeddings).toHaveBeenCalledTimes(2)
        expect(result).toEqual([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]])
    })

    it('should handle custom model option', async () => {
        ollama.embeddings.mockResolvedValue({
            embedding: [0.1, 0.2, 0.3]
        })

        await client.embed(['test'], { model: 'custom-embed-model' })
        
        expect(ollama.embeddings).toHaveBeenCalledWith(
            expect.objectContaining({
                model: 'custom-embed-model'
            }),
            expect.any(Object)
        )
    })

    it('should handle ollama errors', async () => {
        const error = new Error('Ollama connection failed')
        error.code = 'ECONNREFUSED'
        ollama.embeddings.mockRejectedValue(error)

        await expect(client.embed(['test']))
            .rejects.toThrow(APIError)
    })

    it('should pass additional options to ollama', async () => {
        ollama.embeddings.mockResolvedValue({
            embedding: [0.1, 0.2, 0.3]
        })

        await client.embed(['test'], { 
            model: 'custom-model',
            truncate: true 
        })
        
        expect(ollama.embeddings).toHaveBeenCalledWith(
            expect.objectContaining({
                model: 'custom-model',
                truncate: true
            }),
            expect.any(Object)
        )
    })
})