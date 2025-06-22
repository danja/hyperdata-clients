import { describe, it, expect, beforeEach, vi } from 'vitest'
import NomicEmbeddingClient from '../../../src/providers/NomicEmbedding.js'
import APIError from '../../../src/common/APIError.js'

// Mock fetch globally
global.fetch = vi.fn()

describe('NomicEmbeddingClient', () => {
    let client

    beforeEach(() => {
        vi.clearAllMocks()
        client = new NomicEmbeddingClient({ apiKey: 'test-nomic-key' })
    })

    it('should throw error if no API key provided', () => {
        expect(() => new NomicEmbeddingClient()).toThrow('Nomic API key is required')
    })

    it('should use environment variable for API key', () => {
        process.env.NOMIC_API_KEY = 'env-nomic-key'
        const envClient = new NomicEmbeddingClient()
        expect(envClient.apiKey).toBe('env-nomic-key')
        delete process.env.NOMIC_API_KEY
    })

    it('should use custom base URL', () => {
        const customClient = new NomicEmbeddingClient({ 
            apiKey: 'test-key', 
            baseUrl: 'https://custom.api.com' 
        })
        expect(customClient.baseUrl).toBe('https://custom.api.com')
    })

    it('should embed single text successfully', async () => {
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({
                embeddings: [[0.1, 0.2, 0.3]]
            })
        }
        fetch.mockResolvedValue(mockResponse)

        const result = await client.embed(['hello world'])
        
        expect(fetch).toHaveBeenCalledWith(
            'https://api-atlas.nomic.ai/v1/embedding/text',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer test-nomic-key',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'nomic-embed-text-v1.5',
                    texts: ['hello world']
                })
            }
        )
        expect(result).toEqual([[0.1, 0.2, 0.3]])
    })

    it('should embed multiple texts successfully', async () => {
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({
                embeddings: [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
            })
        }
        fetch.mockResolvedValue(mockResponse)

        const result = await client.embed(['hello', 'world'])
        
        expect(result).toEqual([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]])
    })

    it('should handle custom model option', async () => {
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({ embeddings: [[0.1, 0.2, 0.3]] })
        }
        fetch.mockResolvedValue(mockResponse)

        await client.embed(['test'], { model: 'custom-model' })
        
        const call = fetch.mock.calls[0]
        const body = JSON.parse(call[1].body)
        expect(body.model).toBe('custom-model')
    })

    it('should handle API errors', async () => {
        const mockResponse = {
            ok: false,
            status: 401,
            text: vi.fn().mockResolvedValue('Unauthorized')
        }
        fetch.mockResolvedValue(mockResponse)

        await expect(client.embed(['test']))
            .rejects.toThrow(APIError)
    })

    it('should handle network errors', async () => {
        fetch.mockRejectedValue(new Error('Network error'))

        await expect(client.embed(['test']))
            .rejects.toThrow(APIError)
    })

    it('should handle response with data field', async () => {
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({
                data: [[0.1, 0.2, 0.3]]
            })
        }
        fetch.mockResolvedValue(mockResponse)

        const result = await client.embed(['hello'])
        expect(result).toEqual([[0.1, 0.2, 0.3]])
    })
})