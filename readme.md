# AI Client Library

Unified client library for interacting with multiple AI providers including OpenAI, Claude, Mistral, Groq, Perplexity, HuggingFace and Ollama.

## Installation

```bash
npm install ai-client-library
```

## Usage

```javascript
import { createAPIClient } from "ai-client-library"

const client = createAPIClient("openai", {
  apiKey: "your-api-key",
})

// Chat completion
const response = await client.chat([{ role: "user", content: "Hello!" }])

// Stream response
await client.stream([{ role: "user", content: "Tell me a story" }], (chunk) =>
  console.log(chunk)
)
```

## Supported Providers

- OpenAI
- Claude (Anthropic)
- Ollama
- Mistral
- Groq
- Perplexity
- HuggingFace

## Development

```bash
npm install
npm test
```

## License

MIT
