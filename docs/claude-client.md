To use the Claude 3 API with Node.js, you'll need to follow these steps:

## Setup

1. Install the Anthropic SDK:

```bash
npm install @anthropic-ai/sdk
```

2. Import the SDK and configure it with your API key:

```javascript
const { Configuration, OpenAIApi } = require("anthropic")

const configuration = new Configuration({
  apiKey: "YOUR_API_KEY",
})

const anthropic = new OpenAIApi(configuration)
```

Replace 'YOUR_API_KEY' with your actual Claude API key[2][4].

## Making API Requests

Here's an example of how to make a request to Claude using Node.js:

```javascript
async function askClaude(prompt) {
  try {
    const response = await anthropic.createCompletion({
      model: "claude-3-opus-20240229",
      prompt: prompt,
      max_tokens: 100,
    })

    console.log(response.data.choices[0].text)
  } catch (error) {
    console.error("Error:", error)
  }
}

askClaude("Hello Claude! How are you today?")
```

This example uses the `createCompletion` method to send a prompt to Claude and receive a response[2][4].

## Advanced Usage

### Streaming Responses

For real-time responses, you can use the streaming API:

```javascript
const stream = await anthropic.createCompletionStream({
  model: "claude-3-opus-20240229",
  prompt: "Write a short story",
  max_tokens: 1000,
  stream: true,
})

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0].text)
}
```

This will print the response as it's generated[1][3].

### Using in Express.js

To integrate Claude with an Express.js application:

```javascript
const express = require("express")
const app = express()

app.post("/ask-claude", async (req, res) => {
  const { prompt } = req.body

  try {
    const response = await anthropic.createCompletion({
      model: "claude-3-opus-20240229",
      prompt: prompt,
      max_tokens: 100,
    })

    res.json({ answer: response.data.choices[0].text })
  } catch (error) {
    res.status(500).json({ error: "An error occurred" })
  }
})

app.listen(3000, () => console.log("Server running on port 3000"))
```

This creates an endpoint that accepts prompts and returns Claude's responses[3].

Remember to handle API errors, implement proper authentication, and follow Anthropic's usage guidelines when integrating Claude into your Node.js applications.

Citations:
[1] https://www.youtube.com/watch?v=IWYKCnYUo2Y
[2] https://cheatsheet.md/claude/claude-api-key
[3] https://www.youtube.com/watch?v=TSi-643wvQg
[4] https://www.freecodecamp.org/news/introduction-to-claude-ai/
[5] https://www.youtube.com/watch?v=uqLnih0gczM
[6] https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages.html?trk=cndc-detail
[7] https://www.geeksforgeeks.org/getting-started-with-claude-3-and-the-claude-3-api/
[8] https://apidog.com/blog/claude-3-api/
[9] https://github.com/claude-abounegm/cpanel-rest-api/blob/master/package.json
