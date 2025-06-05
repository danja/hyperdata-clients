import dotenv from 'dotenv'
import ClientFactory from '../src/common/ClientFactory.js'

// Load environment variables from .env file
dotenv.config()

// Get raw arguments
const rawArgs = process.argv.slice(2)
let apiName, modelName, promptParts

// Parse arguments manually to preserve quotes and spaces
if (rawArgs.length > 0) {
    apiName = rawArgs[0]
    promptParts = rawArgs.slice(1)

    // Check for --model flag
    const modelFlagIndex = promptParts.findIndex(arg => arg === '--model' || arg === '-m')
    if (modelFlagIndex !== -1 && modelFlagIndex < promptParts.length - 1) {
        modelName = promptParts[modelFlagIndex + 1]
        // Remove model flag and value from prompt parts
        promptParts.splice(modelFlagIndex, 2)
    }
}

const userPrompt = promptParts ? promptParts.join(' ') : ''

// Show help if no arguments or --help flag
if (!apiName || rawArgs.includes('--help') || rawArgs.includes('-h')) {
    console.log(`Usage: node minimal.js <apiName> [prompt..] [--model <modelName>]
    
Arguments:
  apiName          The API provider to use (e.g., ollama, openai)
  prompt           The prompt text to send. If multiple words, use quotes
  
Options:
  --model, -m      The model to use (optional)
  --help, -h       Show this help message`)
    process.exit(1)
}

console.log(`Using API: ${apiName}`)
console.log(`Model: ${modelName || 'default'}`)
console.log(`Prompt: ${userPrompt || 'default'}`)

if (!userPrompt) {
    console.error('Error: No prompt provided')
    process.exit(1)
}

try {
    const clientOptions = {
        model: modelName
    }

    console.log(`Using :
        apiName : ${apiName}
        modelName : ${modelName}
        clientOptions : ${JSON.stringify(clientOptions)}
        userPrompt : ${userPrompt}`)
    // Create client using environment variables for API key
    const client = await ClientFactory.createAPIClient(apiName, clientOptions)
    const response = await client.chat([
        { role: 'user', content: userPrompt }
    ])
    console.log(response)
} catch (error) {
    console.error('Error:', error.message || error)
}

