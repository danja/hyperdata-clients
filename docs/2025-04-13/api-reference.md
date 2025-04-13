# hyperdata-clients API Reference

## Core Classes

### `APIClient` (Abstract Base Class)

Base class that all provider implementations extend.

```javascript
import APIClient from 'hyperdata-clients/src/common/APIClient.js';
```

#### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `constructor` | `config: Object` | - | Initializes the client with configuration |
| `chat` | `messages: Array<Message>`, `options?: Object` | `Promise<string>` | Sends chat messages and returns response |
| `complete` | `prompt: string`, `options?: Object` | `Promise<string>` | Sends a text completion request |
| `embedding` | `text: string\|Array<string>`, `options?: Object` | `Promise<Array<number>>` | Generates embeddings for text |
| `stream` | `messages: Array<Message>`, `callback: Function`, `options?: Object` | `Promise<void>` | Streams response chunks to callback |

### `ClientFactory`

Factory class for creating API clients.

```javascript
import ClientFactory from 'hyperdata-clients/src/common/ClientFactory.js';
```

#### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `createAPIClient` | `provider: string`, `config?: Object` | `Promise<APIClient>` | Creates and returns a provider-specific client |
| `createMCPClient` | `mcpConfig: Object` | `Promise<MCPClient>` | Creates a Multi-provider Client Platform client |

### `KeyManager`

Handles API key management.

```javascript
import KeyManager from 'hyperdata-clients/src/common/KeyManager.js';
```

#### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `getKey` | `config: Object`, `provider: string` | `string` | Gets API key from config or environment |
| `validateKey` | `key: string`, `provider: string` | `void` | Validates key format for provider |
| `rotateKey` | `config: Object`, `provider: string`, `newKey: string` | `string` | Updates API key for provider |

### `APIError`

Custom error class for API-related errors.

```javascript
import APIError from 'hyperdata-clients/src/common/APIError.js';
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Error message |
| `provider` | `string` | Provider name (e.g., 'openai', 'claude') |
| `code` | `string` | Error code from provider |

## Provider Implementations

### `OpenAIClient`

```javascript
import OpenAIClient from 'hyperdata-clients/src/providers/OpenAI.js';
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | - | OpenAI API key |
| `model` | `string` | `'gpt-4-turbo-preview'` | Model to use for completion |
| `clientOptions` | `Object` | `{}` | Options passed to OpenAI client constructor |

### `Claude`

```javascript
import Claude from 'hyperdata-clients/src/providers/Claude.js';
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | - | Claude API key |
| `model` | `string` | `'claude-3-opus-20240229'` | Model to use for completion |
| `clientOptions` | `Object` | `{}` | Options passed to Anthropic client constructor |

### `Mistral`

```javascript
import Mistral from 'hyperdata-clients/src/providers/Mistral.js';
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | - | Mistral API key |
| `model` | `string` | `'mistral-tiny'` | Model to use for completion |
| `clientOptions` | `Object` | `{}` | Options passed to Mistral client constructor |

### `Ollama`

```javascript
import Ollama from 'hyperdata-clients/src/providers/Ollama.js';
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | `'NO_KEY_REQUIRED'` | Usually not needed for Ollama |
| `model` | `string` | `'qwen2:1.5b'` | Model to use for completion |
| `baseUrl` | `string` | `'http://localhost:11434'` | Ollama server URL |

### `Groqq`

```javascript
import Groqq from 'hyperdata-clients/src/providers/Groqq.js';
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | - | Groq API key |
| `model` | `string` | `'llama3-8b-8192'` | Model to use for completion |
| `clientOptions` | `Object` | `{}` | Options passed to Groq client constructor |

### `Perplexity`

```javascript
import Perplexity from 'hyperdata-clients/src/providers/Perplexity.js';
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | - | Perplexity API key |
| `model` | `string` | `'pplx-7b-chat'` | Model to use for completion |
| `clientOptions` | `Object` | `{}` | Options passed to Perplexity client constructor |

### `HuggingFace`

```javascript
import HuggingFace from 'hyperdata-clients/src/providers/HuggingFace.js';
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | - | HuggingFace API key |
| `model` | `string` | `'gpt2'` | Model to use for completion |

## Types

### `Message`

Object representing a chat message.

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

### `AIConfig`

Object representing client configuration.

```typescript
interface AIConfig {
  apiKey?: string;
  clientOptions?: Record<string, any>;
  mcp?: MCPConfig;
}
```

### `MCPConfig`

Multi-provider Client Platform configuration.

```typescript
interface MCPConfig {
  resources?: Record<string, MCPResource>;
  tools?: Record<string, MCPTool>;
  prompts?: Record<string, MCPPrompt>;
  stateFile?: string;
  onStateChange?: (state: MCPState) => Promise<void>;
}
```
