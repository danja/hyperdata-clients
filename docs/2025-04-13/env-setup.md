# Environment Setup Guide

This guide covers how to configure your environment for using hyperdata-clients.

## API Keys Setup

Create a `.env` file in your project root:

```
# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx

# Claude (Anthropic)
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx

# Mistral
MISTRAL_API_KEY=xxxxxxxxxxxxxxxxxxxx

# Groq
GROQ_API_KEY=gsk-xxxxxxxxxxxxxxxxxxxx

# Perplexity
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxx

# HuggingFace
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxx

# Ollama (local deployment - specify host if not default)
OLLAMA_HOST=http://localhost:11434
```

## Ollama Setup (Local AI)

For local AI capabilities with Ollama:

1. Install Ollama: https://ollama.com/download
2. Pull models:
   ```bash
   ollama pull llama2
   ollama pull qwen2:1.5b
   ollama pull nomic-embed-text
   ```
3. Start Ollama server:
   ```bash
   ollama serve
   ```

## Project Integration

1. Install as dependency:
   ```bash
   npm install github:danja/hyperdata-clients
   ```

2. Load environment variables:
   ```javascript
   import dotenv from 'dotenv';
   dotenv.config();
   ```

3. Configure the provider you want to use in your code or through environment variables.

## Security Best Practices

- Never commit `.env` files to version control
- Use different API keys for development and production
- Consider using a secrets manager for production environments
- Implement rate limiting to prevent excessive API usage
- Rotate API keys periodically

## Troubleshooting

Common issues:

1. **API Key Invalid Format**: Ensure keys match the expected pattern for each provider
2. **Connection Issues with Ollama**: Check if Ollama server is running locally
3. **Rate Limiting Errors**: Implement rate limiting strategies (see src/pending/ratelimiting/)
4. **Model Not Found**: Verify the model name is correct for the provider
