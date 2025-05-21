import { describe, it, expect } from 'vitest'
import APIError from '../../src/common/APIError.js'

describe('APIError', () => {
    it('should create an error with all properties', () => {
        const message = 'Test error message'
        const provider = 'test-provider'
        const code = 'TEST_ERROR'

        const error = new APIError(message, provider, code)

        expect(error).toBeInstanceOf(APIError)
        expect(error.message).toBe(message)
        expect(error.provider).toBe(provider)
        expect(error.code).toBe(code)
        expect(error.name).toBe('APIError')
    })

    it('should work with partial properties', () => {
        const error = new APIError('Test message')

        expect(error.message).toBe('Test message')
        expect(error.provider).toBeUndefined()
        expect(error.code).toBeUndefined()
    })

    it('should be instanceof Error', () => {
        const error = new APIError('Test')
        expect(error).toBeInstanceOf(Error)
    })

    it('should be catchable as Error', () => {
        let caught = null
        try {
            throw new APIError('Test throw')
        } catch (e) {
            caught = e
        }
        expect(caught).toBeInstanceOf(Error)
        expect(caught).toBeInstanceOf(APIError)
    })
})
