import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Builds the MCP server with all tools, resources and prompts registered.
 * Kept separate from the transport so tests can connect to it in memory.
 * Add new capabilities here (or in files imported from here).
 */
export function createServer(): McpServer {
  const server = new McpServer({ name: "mcp-playground", version: "0.1.0" });

  // ── Tools ────────────────────────────────────────────────────────────────
  server.registerTool(
    "echo",
    {
      title: "Echo",
      description: "Returns the text it is given. Handy for checking the connection.",
      inputSchema: { text: z.string().describe("Text to echo back") },
    },
    async ({ text }) => ({ content: [{ type: "text", text }] }),
  );

  server.registerTool(
    "add",
    {
      title: "Add numbers",
      description: "Adds two numbers.",
      inputSchema: { a: z.number(), b: z.number() },
      outputSchema: { sum: z.number() },
    },
    async ({ a, b }) => {
      const result = { sum: a + b };
      return {
        content: [{ type: "text", text: String(result.sum) }],
        structuredContent: result,
      };
    },
  );

  server.registerTool(
    "current_time",
    {
      title: "Current time",
      description: "Returns the current date and time, optionally in an IANA time zone.",
      inputSchema: {
        timeZone: z.string().optional().describe("IANA zone, e.g. Europe/Amsterdam"),
      },
    },
    async ({ timeZone }) => {
      try {
        const text = new Date().toLocaleString("en-GB", { timeZone, dateStyle: "full", timeStyle: "long" });
        return { content: [{ type: "text", text }] };
      } catch {
        return { isError: true, content: [{ type: "text", text: `Unknown time zone: ${timeZone}` }] };
      }
    },
  );

  // ── Resources ────────────────────────────────────────────────────────────
  server.registerResource(
    "about",
    "playground://about",
    { title: "About", description: "What this server is", mimeType: "text/plain" },
    async (uri) => ({
      contents: [{ uri: uri.href, text: "mcp-playground: a sandbox MCP server for experiments." }],
    }),
  );

  server.registerResource(
    "greeting",
    new ResourceTemplate("greeting://{name}", { list: undefined }),
    { title: "Greeting", description: "A personalised greeting" },
    async (uri, { name }) => ({
      contents: [{ uri: uri.href, text: `Hello, ${name}!` }],
    }),
  );

  // ── Prompts ──────────────────────────────────────────────────────────────
  server.registerPrompt(
    "review_code",
    {
      title: "Review code",
      description: "Asks the model to review a snippet of code.",
      argsSchema: { code: z.string() },
    },
    ({ code }) => ({
      messages: [
        { role: "user", content: { type: "text", text: `Please review this code:\n\n${code}` } },
      ],
    }),
  );

  return server;
}
