import { expect } from '../helpers/testHelper.js'
import APIClient from '../../src/common/APIClient.js'

describe('APIClient', () => {
    class TestClient extends APIClient {
        async chat(messages, options) { return 'chat response' }
        async complete(prompt, options) { return 'completion response' }
        async embedding(text, options) { return [0.1, 0.2, 0.3] }
        async stream(messages, callback, options) { callback('stream response') }
    }

    it('should not allow instantiation of abstract class', () => {
        expect(() => new APIClient()).to.throw('Cannot instantiate abstract class')
    })

    it('should store configuration', () => {
        const config = { apiKey: 'test-key', model: 'test-model' }
        const client = new TestClient(config)
        expect(client.config).to.deep.equal(config)
    })

    it('should allow instantiation of concrete implementation', () => {
        const client = new TestClient()
        expect(client).to.be.instanceOf(APIClient)
    })

    it('should require implementation of chat()', async () => {
        class InvalidClient extends APIClient { }
        const client = new InvalidClient()
        await expect(client.chat([])).to.be.rejectedWith('Method chat() must be implemented')
    })

    it('should require implementation of complete()', async () => {
        class InvalidClient extends APIClient { }
        const client = new InvalidClient()
        await expect(client.complete('test')).to.be.rejectedWith('Method complete() must be implemented')
    })

    it('should require implementation of embedding()', async () => {
        class InvalidClient extends APIClient { }
        const client = new InvalidClient()
        await expect(client.embedding('test')).to.be.rejectedWith('Method embedding() must be implemented')
    })

    it('should require implementation of stream()', async () => {
        class InvalidClient extends APIClient { }
        const client = new InvalidClient()
        await expect(client.stream([], () => { })).to.be.rejectedWith('Method stream() must be implemented')
    })

    describe('Concrete implementation', () => {
        let client

        beforeEach(() => {
            client = new TestClient()
        })

        it('should implement chat() correctly', async () => {
            const result = await client.chat([])
            expect(result).to.equal('chat response')
        })

        it('should implement complete() correctly', async () => {
            const result = await client.complete('test')
            expect(result).to.equal('completion response')
        })

        it('should implement embedding() correctly', async () => {
            const result = await client.embedding('test')
            expect(result).to.deep.equal([0.1, 0.2, 0.3])
        })

        it('should implement stream() correctly', async () => {
            let response
            await client.stream([], (data) => { response = data })
            expect(response).to.equal('stream response')
        })
    })
})
