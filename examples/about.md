The minimal CLI here can be run as :

```sh
npm run ask [args]
```

or

```sh
node examples/minimal.js [args]
```

The _args_ are optional, where eg. :

```sh
npm run ask ollama --model 'qwen2:1.5b' 'how are you?'
```

- API is Ollama
- model is qwen2:1.5b
- prompt is "how are you?"

Internally a factory class `src/common/ClientFactory.js` is used to create an instance of a client for the specified API and model. This instance is then called with the prompt and whatever's returned is displayed.

Working hardcoded examples can be found in `examples/OllamaMinimal.js` and `examples/MistralMinimal.js`.
