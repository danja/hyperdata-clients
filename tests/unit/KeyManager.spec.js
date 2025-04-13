import { expect, MOCK_KEYS, clearEnvKeys } from '../helpers/testHelper.js'
import KeyManager from '../../src/common/KeyManager.js'

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

    describe('validateKey', () => {
        Object.entries(MOCK_KEYS).forEach(([provider, validKey]) => {
            describe(provider, () => {
                it(`should accept valid ${provider} key`, () => {
                    expect(() => KeyManager.validateKey(validKey, provider)).to.not.throw()
                })

                it(`should reject invalid ${provider} key format`, () => {
                    expect(() => KeyManager.validateKey('invalid-key', provider))
                        .to.throw(`Invalid ${provider} API key format`)
                })

                it(`should reject empty ${provider} key`, () => {
                    expect(() => KeyManager.validateKey('', provider))
                        .to.throw(`${provider} API key is required`)
                })

                it(`should reject null/undefined ${provider} key`, () => {
                    expect(() => KeyManager.validateKey(null, provider))
                        .to.throw(`${provider} API key is required`)
                    expect(() => KeyManager.validateKey(undefined, provider))
                        .to.throw(`${provider} API key is required`)
                })
            })
        })
    })

    describe('rotateKey', () => {
        const provider = 'openai'
        const config = { apiKey: MOCK_KEYS.openai }

        beforeEach(() => {
            clearEnvKeys()
        })

        it('should update environment variable with new key', () => {
            const newKey = MOCK_KEYS.openai
            const result = KeyManager.rotateKey(config, provider, newKey)
            expect(result).to.equal(newKey)
            expect(process.env.OPENAI_API_KEY).to.equal(newKey)
        })

        it('should validate new key before rotating', () => {
            const invalidKey = 'invalid-key'
            expect(() => KeyManager.rotateKey(config, provider, invalidKey))
                .to.throw(`Invalid ${provider} API key format`)
        })
    })
})
