import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { LangflowClient } from "@datastax/langflow-client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getConfigPath() {
  return path.join(os.homedir(), ".git-ai-message", "config.json");
}

function ensureConfigDir() {
  const configDir = path.dirname(getConfigPath());
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

function createDefaultConfig() {
  ensureConfigDir();
  const defaultConfig = {
    langflowUrl: "http://localhost:7860",
    flowId: "",
    apiKey: "",
  };
  fs.writeFileSync(getConfigPath(), JSON.stringify(defaultConfig, null, 2));
}

function loadConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return null;
  }
  try {
    const configData = fs.readFileSync(configPath, "utf8");
    return JSON.parse(configData);
  } catch (error) {
    throw new Error(`Failed to parse config file: ${error.message}`);
  }
}

function validateConfig(config) {
  if (!config.langflowUrl) {
    throw new Error("Config missing required field: langflowUrl");
  }
  if (!config.flowId) {
    throw new Error("Config missing required field: flowId");
  }
  return true;
}

function openConfigInEditor() {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    createDefaultConfig();
  }

  let command, args;
  const platform = os.platform();

  if (platform === "darwin") {
    command = "open";
    args = [configPath];
  } else if (platform === "win32") {
    command = "cmd";
    args = ["/c", "start", "", configPath];
  } else {
    command = process.env.EDITOR || "xdg-open";
    args = [configPath];
  }

  const child = spawn(command, args, {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

async function runLangflowFlow(config) {
  try {
    const langflowClient = new LangflowClient({
      baseUrl: config.langflowUrl,
      apiKey: config.apiKey || undefined,
    });
    const flow = langflowClient.flow(config.flowId);

    const currentDir = process.cwd();
    const response = await flow.run(currentDir);

    console.log(response.chatOutputText());
  } catch (error) {
    console.error("Error running Langflow flow:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data || error.response);
    }
    process.exit(1);
  }
}

function showVersion() {
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  console.log(`git-ai-message v${packageJson.version}`);
}

function showHelp() {
  console.log(`
git-ai-message - Run Langflow flows from the command line

Usage:
  git-ai-message [command]

Commands:
  (none)          Run the configured Langflow flow with current directory
  run             Same as default command
  config          Open configuration file in default editor

Options:
  -v, --version   Show version number
  -h, --help      Show this help message

Configuration:
  Config file location: ${getConfigPath()}
  Run 'git-ai-message config' to set up your Langflow connection
`);
}

async function runMainCommand() {
  const config = loadConfig();

  if (!config) {
    console.error("Error: Configuration file not found.");
    console.error(
      `Please run 'git-ai-message config' to set up your configuration.`
    );
    process.exit(1);
  }

  try {
    validateConfig(config);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(
      `Please run 'git-ai-message config' to fix your configuration.`
    );
    process.exit(1);
  }

  await runLangflowFlow(config);
}

export async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case "--version":
      case "-v":
        showVersion();
        break;

      case "--help":
      case "-h":
        showHelp();
        break;

      case "config":
        openConfigInEditor();
        break;

      case "run":
      case undefined:
        await runMainCommand();
        break;

      default:
        console.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}
