#!/usr/bin/env node

import { createEmbeddingClient } from '../src/index.js'
import dotenv from 'dotenv'

dotenv.config()

async function demonstrateEmbeddings() {
    try {
        console.log('=== Embedding Demo ===\n')

        // Example texts to embed
        const texts = [
            'The quick brown fox jumps over the lazy dog',
            'Artificial intelligence is transforming technology',
            'Machine learning models process data efficiently'
        ]

        // Try Ollama (local, no API key needed)
        console.log('1. Testing Ollama Embedding Client:')
        try {
            const ollamaClient = await createEmbeddingClient('ollama')
            console.log('   Created Ollama client successfully')
            
            // Note: This would only work if Ollama is running locally with nomic-embed-text-v1.5 model
            // const embeddings = await ollamaClient.embed(texts.slice(0, 1))
            // console.log(`   Generated embedding with ${embeddings[0].length} dimensions`)
            console.log('   (Requires Ollama running locally with nomic-embed-text-v1.5 model)')
        } catch (error) {
            console.log(`   Error: ${error.message}`)
        }

        console.log()

        // Try Nomic (requires API key)
        console.log('2. Testing Nomic Embedding Client:')
        try {
            if (process.env.NOMIC_API_KEY) {
                const nomicClient = await createEmbeddingClient('nomic')
                console.log('   Created Nomic client successfully')
                
                // Embed a single text
                const singleEmbedding = await nomicClient.embedSingle(texts[0])
                console.log(`   Single embedding: ${singleEmbedding.length} dimensions`)
                
                // Embed multiple texts
                const multiEmbeddings = await nomicClient.embed(texts)
                console.log(`   Multiple embeddings: ${multiEmbeddings.length} texts, ${multiEmbeddings[0].length} dimensions each`)
            } else {
                console.log('   NOMIC_API_KEY not found in environment')
            }
        } catch (error) {
            console.log(`   Error: ${error.message}`)
        }

        console.log('\n=== Demo Complete ===')
    } catch (error) {
        console.error('Demo failed:', error.message)
        process.exit(1)
    }
}

demonstrateEmbeddings()