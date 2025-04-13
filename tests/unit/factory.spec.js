// spec/factory.spec.js
import { expect } from 'chai'
import { createAPIClient } from '../src/factory.js'
import { OpenAIClient } from '../src/providers/openai.js'
import { Claude } from '../src/providers/claude.js'

describe('APIClient Factory', () => {
    it('should create OpenAI client', () => {
        const client = createAPIClient('openai', { apiKey: 'test' })
        expect(client).to.be.instanceOf(OpenAIClient)
    })

    it('should create Claude client', () => {
        const client = createAPIClient('claude', { apiKey: 'test' })
        expect(client).to.be.instanceOf(Claude)
    })

    it('should throw error for unknown provider', () => {
        expect(() => createAPIClient('unknown')).to.throw('Unknown AI provider: unknown')
    })

    it('should be case insensitive', () => {
        const client = createAPIClient('OPENAI', { apiKey: 'test' })
        expect(client).to.be.instanceOf(OpenAIClient)
    })
})
