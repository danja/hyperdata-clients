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

import { OpenAI, Claude, KeyManager } from 'hyperdata-clients';

## Status: 2025-06-04 doc fixes, barrel file, version bump.

Working for me against :

- Ollama (local)
- Mistral (free & speedy, needs API key)
- OpenAI (requires $s and API key)

Various other clients sketched out, will likely need tweaking.

Only tested on recent Ubuntu.

There's a very basic CLI for checking the thing (see below), also runnable hardcoded examples eg.

```sh
node examples/MistralMinimal.js
```



## Features

- Support for multiple AI providers
- Environment-based configuration
- Secure API key management
- Consistent interface across providers
- Type definitions included
- Extensive test coverage

### Providers
- Ollama 
- OpenAI
- Claude 
- Mistral
- Groq
- Perplexity
- HuggingFace

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

## Documentation

Comprehensive API documentation is available in the `docs` directory. To generate or update the documentation:

```sh
# Install dependencies (if not already installed)
npm install

# Generate documentation
npm run docs

# The documentation will be available in docs/jsdoc/index.html
```

The documentation includes:
- API reference for all components
- Getting started guide
- Code examples
- Configuration options

## Testing

The project includes an extensive test suite to ensure reliability and compatibility across different providers. To run the tests:

```sh
# Run all tests
npm test

# Run tests with coverage report
npm run coverage

# Run tests in watch mode during development
npm run test:ui
```

### Test Coverage

Test coverage reports are generated in the `coverage` directory after running the coverage command. This includes:
- Line coverage
- Function coverage
- Branch coverage

## Contributing

Contributions are welcome! Please ensure all tests pass and add new tests for any new features or bug fixes.

MIT License
