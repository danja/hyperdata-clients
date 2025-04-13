import dotenv from 'dotenv'
import ClientFactory from '../src/common/ClientFactory.js'

// Load environment variables from .env file
dotenv.config()

const [, , apiName, userPrompt] = process.argv

if (!apiName) {
    console.error('Error: API name is required as the first argument.')
    process.exit(1)
}

const defaultPrompt = 'What is your name, and which model are you?'
const prompt = userPrompt || defaultPrompt

console.log(`Using API: ${apiName}`)
console.log(`Prompt: ${prompt}`);

(async () => {
    try {
        const client = await ClientFactory.createAPIClient(apiName, { apiKey: process.env[`${apiName.toUpperCase()}_API_KEY`] })

        const response = await client.chat([
            { role: 'user', content: prompt }
        ])

        console.log('Response:', response)
    } catch (error) {
        console.error('Error:', error)
    }
})()
