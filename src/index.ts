import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

console.log('MCP Client Demo!');


class MCPClient {
    #mcp: Client;
    #transport: StdioClientTransport | null = null;
    #tools: Tool[] = [];

    constructor() {
        this.#mcp = new Client({ name: "mcp-client-cli", version: "0.0.1" });
    }

    async connectToServer(serverScriptPath: string) {
        try {
            const isJS = serverScriptPath.endsWith(".js");
            const isPy = serverScriptPath.endsWith(".py");

            if (!isJS && !isPy) {
                throw new Error("Server Script must be .js or .py file");
            }

            const command = isPy ? process.platform === "win32" ? "python" : "python3" : process.execPath;

            this.#transport = new StdioClientTransport({
                command,
                args: [serverScriptPath]
            });

            this.#mcp.connect(this.#transport);

            const toolsResult = await this.#mcp.listTools();
            this.#tools = toolsResult.tools.map((tool) => {
                return {
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                }
            });

            console.log("Connected to server with tools: ", this.#tools.map(({ name }) => name));

        } catch (e: unknown) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }



    chatLoop() { }

    cleanup() { }
}

async function main() {
    if (process.argv.length < 3) {
        console.log("Usage: npm run start <path_to_server_script>");
        return;
    }

    const mcpClient = new MCPClient();
    try {
        await mcpClient.connectToServer(process.argv[2]);
        await mcpClient.chatLoop();
    } finally {
        await mcpClient.cleanup();
        process.exit(0);
    }
}


main();