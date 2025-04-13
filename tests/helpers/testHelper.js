// Test helper utilities
import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const expect = chai.expect
export { expect }

// Common test data
export const TEST_CONFIG = {
    apiKey: 'test-key-123',
    baseUrl: 'https://api.test.com',
    model: 'test-model',
    maxRetries: 3,
    timeout: 30000
}

// Mock API keys for different providers
export const MOCK_KEYS = {
    openai: 'sk-test1234567890abcdefghijklmnopqrstuvwxyz',
    claude: 'sk-ant-test123456789012345678901234567890ab',
    ollama: 'NO_KEY_REQUIRED',
    mistral: '1234567890123456789012345678901234567890',
    groq: 'gsk_test1234567890123456789012345678901234',
    perplexity: 'pplx-test123456789012345678901234567890123456',
    huggingface: 'hf_test1234567890123456789012345678901234567890',
    mcp: 'mcp-test-key-123456789012345678901234567890'
}

// Clear environment variables for providers
export const clearEnvKeys = () => {
    Object.keys(MOCK_KEYS).forEach(provider => {
        delete process.env[`${provider.toUpperCase()}_API_KEY`]
    })
}

// Common assertions
export const expectError = (error, { message, provider, code }) => {
    expect(error).to.be.instanceOf(Error)
    if (message) expect(error.message).to.equal(message)
    if (provider) expect(error.provider).to.equal(provider)
    if (code) expect(error.code).to.equal(code)
}

// Mock response generator
export const mockResponse = (status = 200, data = {}, headers = {}) => ({
    status,
    data,
    headers,
    ok: status >= 200 && status < 300
})

// Mock API response delay
export const mockDelay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))
