import ClientFactory from '../../src/common/ClientFactory.js'

describe('Ollama Client Instantiation', () => {
    it('should return an instance of Ollama with a chat method', async () => {
        const client = await ClientFactory.createAPIClient('ollama', { apiKey: 'test-key' })
        expect(client).toBeDefined()
        expect(typeof client.chat).toBe('function')
    })
})
