import { createAPIClient } from '../common/ClientFactory.js'

const client = createAPIClient('openai', { apiKey: 'your-key' })
const response = await client.chat([
    { role: 'user', content: 'Hello!' } // should be using .env
])