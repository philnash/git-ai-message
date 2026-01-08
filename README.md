# git-ai-message

A simple CLI tool that uses Langflow to process your current working directory and generate AI-powered responses.

Read about how to build the Langflow flow and this application in the blog post [Generate commit messages with AI using Langflow and Git MCP server](https://www.langflow.org/blog/ai-generated-commit-messages-langflow-git-mcp).

## Installation

```bash
npm install
npm link
```

This will make the `git-ai-message` command available globally on your system.

## Configuration

### The Langflow Flow

You will need a Langflow flow that this tool can use to generate the commit messages. You will need to install [Langflow Desktop](https://www.langflow.org/desktop) or follow the [instructions from the documentation to install Langflow in other ways](https://docs.langflow.org/get-started-installation).

With Langflow installed you can import the flow JSON from this repo. You can find it in [`./langflow/AI Commit Writer.json`](./langflow/AI%20Commit%20Writer.json).

You can import the JSON flow into your Langflow install. Configure an API key for the language model you want to use and it should be ready to go.

### Configuring the tool

Before using the tool, you need to configure your Langflow connection:

```bash
git-ai-message config
```

This will create a configuration file at `~/.git-ai-message/config.json` and open it in your default editor. You need to fill in:

- `langflowUrl`: The URL of your Langflow instance (default: `http://localhost:7860`)
- `flowId`: The ID of the Langflow flow you want to run (required)
- `apiKey`: Optional API key for authentication (leave empty if not needed)

Example configuration:

```json
{
  "langflowUrl": "http://localhost:7860",
  "flowId": "your-flow-id-here",
  "apiKey": ""
}
```

## Usage

### Run the Langflow flow

Run the configured Langflow flow with your current working directory as input:

```bash
git-ai-message
```

or explicitly:

```bash
git-ai-message run
```

The tool will:

1. Get your current working directory using `process.cwd()`
2. Send it to your configured Langflow flow
3. Display the response from Langflow

### Manage configuration

Open the configuration file in your default editor:

```bash
git-ai-message config
```

### Show version

```bash
git-ai-message --version
git-ai-message -v
```

### Show help

```bash
git-ai-message --help
git-ai-message -h
```

## Requirements

- Node.js (ES modules support)
- A running Langflow instance
- A configured Langflow flow that accepts text input

## Dependencies

- `@datastax/langflow-client` - Official Langflow client for Node.js

## License

MIT
