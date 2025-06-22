# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

hyperdata-clients is a unified client library for multiple AI providers (OpenAI, Claude, Mistral, Ollama, Groq, Perplexity, HuggingFace) with a consistent interface. It uses a factory pattern with abstract base classes to ensure provider implementations follow the same API contract.

## Common Commands

```bash
# Run tests
npm test
npm run test:ui      # Interactive test UI
npm run coverage     # Generate coverage report

# Quick testing via CLI
npm run ask          # Uses examples/minimal.js
npm run ask mistral "your prompt"
npm run ask ollama --model qwen2:1.5b "your prompt" 

# Generate documentation
npm run docs         # Creates docs/jsdoc/

# Generate repo summary
npm run rp           # Uses repomix
```

## Architecture

### Core Components
- **ClientFactory** (`src/common/ClientFactory.js`): Factory for creating provider instances
- **APIClient** (`src/common/APIClient.js`): Abstract base class defining the interface all providers must implement (`chat`, `complete`, `embedding`, `stream`)
- **KeyManager** (`src/common/KeyManager.js`): Handles API key resolution from config or environment
- **APIError** (`src/common/APIError.js`): Standardized error handling

### Provider Implementation Pattern
All providers in `src/providers/` extend APIClient and must implement:
- `chat(messages, options)` - Main chat interface
- `complete(prompt, options)` - Simple completion wrapper
- `embedding(text, options)` - Text embeddings
- `stream(messages, callback, options)` - Streaming responses

### Key Features
- Environment-based configuration via `.env` files
- Consistent interface across all providers
- TypeScript definitions in `types/`
- MCP (Model Context Protocol) support via separate MCPClient class
- Factory pattern with provider validation

### Testing Structure
- Unit tests in `tests/unit/` - Test individual components
- Provider-specific tests in `tests/unit/providers/`
- Mock implementations in `tests/__mocks__/`
- Uses Vitest as test runner with coverage reporting

### Configuration
API keys resolved in this order:
1. Passed in config object
2. Environment variables (e.g., `OPENAI_API_KEY`, `MISTRAL_API_KEY`)
3. `.env` file

Node.js >= 18.0.0 required.