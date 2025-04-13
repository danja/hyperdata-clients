import { expect } from 'chai'
import { expectError } from '../helpers/testHelper.js'
import APIError from '../../src/common/APIError.js'

describe('APIError', () => {
    it('should create an error with all properties', () => {
        const message = 'Test error message'
        const provider = 'test-provider'
        const code = 'TEST_ERROR'

        const error = new APIError(message, provider, code)

        expectError(error, {
            message: message,
            provider: provider,
            code: code
        })
        expect(error.name).to.equal('APIError')
    })

    it('should work with partial properties', () => {
        const error = new APIError('Test message')

        expect(error.message).to.equal('Test message')
        expect(error.provider).to.be.undefined
        expect(error.code).to.be.undefined
    })

    it('should be instanceof Error', () => {
        const error = new APIError('Test')
        expect(error).to.be.instanceOf(Error)
    })

    it('should be catchable as Error', () => {
        let caught = null
        try {
            throw new APIError('Test throw')
        } catch (e) {
            caught = e
        }
        expect(caught).to.be.instanceOf(Error)
        expect(caught).to.be.instanceOf(APIError)
    })
})
