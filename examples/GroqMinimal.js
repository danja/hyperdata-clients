import dotenv from 'dotenv'
import ClientFactory from '../src/common/ClientFactory.js'

// Load environment variables from .env file
dotenv.config()

// Set the API key in system environment, .env or the local process environment
// process.env.GROQ_API_KEY = 'YOUR_GROQ_API_KEY';
const prompt = 'What is your name, and which model are you?'

console.log(prompt)

try {

    const client = await ClientFactory.createAPIClient('groq', { model: 'llama-3.1-8b-instant', apiKey: process.env.GROQ_API_KEY })

    const response = await client.chat([
        { role: 'user', content: prompt }
    ])
    console.log(response)
} catch (error) {
    console.error('Error:', error)
}