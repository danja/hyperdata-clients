import dotenv from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'

class KeyManager {
    static getKey(config, provider) {
        // Explicitly load from .env file in the current directory
        const envPath = resolve(process.cwd(), '.env')
        if (existsSync(envPath)) {
            dotenv.config({ path: envPath, override: true })
        }

        // Priority order:
        // 1. Environment variable from .env (with override)
        // 2. Config object's apiKey
        const envKey = process.env[`${provider.toUpperCase()}_API_KEY`]
        const key = envKey || (config && config.apiKey)

        if (!key) {
            throw new Error(`${provider} API key is required`)
        }

        // Debug logging
        console.debug(`Using ${provider} key from: ${envKey ? '.env file' : 'config object'}`)

        this.validateKey(key, provider)
        return key
    }

    static validateKey(key, provider) {
        if (!key) {
            throw new Error(`${provider} API key is required`)
        }

        const patterns = {
            ollama: /^NO_KEY_REQUIRED$/i,
            openai: /^sk-(?:proj-)?[a-zA-Z0-9_-]+$/,
            claude: /^sk-ant-[a-zA-Z0-9]{32,}$/,
            mistral: /^[a-zA-Z0-9]{32,}$/,
            groq: /^gsk_[a-zA-Z0-9]{32,}$/,
            perplexity: /^pplx-[a-zA-Z0-9]{32,}$/,
            huggingface: /^hf_[a-zA-Z0-9]{32,}$/,
            mcp: /^mcp-[a-zA-Z0-9_-]{20,}$/
        }

        if (patterns[provider] && !patterns[provider].test(key)) {
            throw new Error(`Invalid ${provider} API key format`)
        }
    }

    static rotateKey(config, provider, newKey) {
        this.validateKey(newKey, provider)
        const envVar = `${provider.toUpperCase()}_API_KEY`
        process.env[envVar] = newKey
        return newKey
    }
}

export default KeyManager