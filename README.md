# hyperdata-clients

Yet another node API client library for interacting with AI providers using a common interface.

_I wanted my own so I knew how it worked_

```sh
npm run ask mistral 'In brief, how many AGIs will it take to change a lightbulb?'
...
Using API: mistral
Model: default
Prompt: In brief, how many AGIs will it take to change a lightbulb?
Using mistral key from: .env file

...it's uncertain how many would be needed to change a lightbulb...
```

## Status: 2025-04-13

Working for me against :

- Ollama (local)
- Mistral (free & speedy, needs API key)
- OpenAI (requires $s and API key)

Various other clients sketched out, will likely need tweaking.

Only tested on recent Ubuntu.

There's a very basic CLI for checking the thing, also runnable hardcoded examples eg.

```sh
node examples/MistralMinimal.js
```

Jasmine tests currently all broken after an afternoon getting it to work...

## Features

- Support for multiple AI providers
- Environment-based configuration
- Secure API key management
- Consistent interface across providers
- Type definitions included
- Extensive test coverage

## Installation

Prequisites : recent node

```sh
git clone https://github.com/danja/hyperdata-clients.git
cd hyperdata-clients
npm install
```

## CLI

Really minimal for testing purposes :

```bash
# Basic usage
npm run ask [provider] [options] "your prompt"

# or more directly
node examples/minimal.js [provider] [options] "your prompt"

# Mistral
npm run ask mistral --model 'open-codestral-mamba' 'tell me about yourself'

# Example with Ollama running locally, it'll default model to qwen2:1.5b
npm run ask ollama 'how are you?'

# requires an API key
node examples/minimal.js openai 'what are you?'
```

MIT License
