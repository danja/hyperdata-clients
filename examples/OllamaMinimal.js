import { createAIClient } from '../src/common/ClientFactory.js';

const client = createAIClient('ollama', { apiKey: 'your-key' });
const response = await client.chat([
    { role: 'user', content: 'Hello!' } // should be using .env
]);