import dotenv from 'dotenv'
import ClientFactory from '../src/common/ClientFactory.js'

// Load environment variables from .env file
dotenv.config()

// Set the Ollama API key in the process environment
// process.env.OLLAMA_API_KEY = 'NO_KEY_REQUIRED';
const prompt = 'What is your name, and which model are you?'

console.log(prompt)

try {

    const client = await ClientFactory.createAPIClient('mistral', { model: 'open-codestral-mamba', apiKey: process.env.MISTRAL_API_KEY })

    const response = await client.chat([
        { role: 'user', content: prompt }
    ])
    console.log(response)
} catch (error) {
    console.error('Error:', error)
}
