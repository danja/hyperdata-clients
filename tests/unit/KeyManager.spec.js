import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import KeyManager from '../../src/common/KeyManager.js'

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

describe('KeyManager', () => {
    // Mock process.cwd to return a consistent path
    const originalCwd = process.cwd
    const mockCwd = () => '/test/path'

    beforeEach(() => {
        clearEnvKeys()
        process.cwd = mockCwd
    })

    afterEach(() => {
        process.cwd = originalCwd
    })

    describe('getKey', () => {
        const provider = 'openai'
        const config = { apiKey: MOCK_KEYS.openai }

        it('should return key from config when env variable not present', () => {
            const key = KeyManager.getKey(config, provider)
            expect(key).to.equal(MOCK_KEYS.openai)
        })

        it('should prefer env variable over config key', () => {
            process.env.OPENAI_API_KEY = MOCK_KEYS.openai
            const key = KeyManager.getKey({ apiKey: 'different-key' }, provider)
            expect(key).to.equal(MOCK_KEYS.openai)
        })

        it('should throw when no key is available', () => {
            expect(() => KeyManager.getKey({}, provider))
                .to.throw('openai API key is required')
        })

        it('should handle missing config object', () => {
            expect(() => KeyManager.getKey(null, provider))
                .to.throw('openai API key is required')
        })
    })

    describe('rotateKey', () => {
        const provider = 'openai'
        const config = { apiKey: 'old-key' }

        beforeEach(() => {
            clearEnvKeys()
        })

        it('should update environment variable with new key', () => {
            const newKey = 'new-test-key-123'
            const result = KeyManager.rotateKey(config, provider, newKey)
            expect(result).toBe(newKey)
            expect(process.env.OPENAI_API_KEY).toBe(newKey)
        })
    })
})
