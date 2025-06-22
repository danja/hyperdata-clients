class EmbeddingClient {
    constructor(config = {}) {
        if (this.constructor === EmbeddingClient) {
            throw new Error('Cannot instantiate abstract class')
        }
        this.config = config
    }

    async embed(texts, options = {}) {
        throw new Error('Method embed() must be implemented')
    }

    async embedSingle(text, options = {}) {
        const results = await this.embed([text], options)
        return results[0]
    }
}

export default EmbeddingClient