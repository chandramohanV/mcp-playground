# mcp-playground

A TypeScript sandbox for building and testing MCP servers (`@modelcontextprotocol/sdk`, stdio transport).

## Layout

| File | Purpose |
|---|---|
| `src/createServer.ts` | Register tools, resources and prompts here |
| `src/server.ts` | Entry point; connects the server to stdio |
| `src/test/server.test.ts` | In-memory client tests (`node:test`) |

## Commands

```bash
npm install          # once
npm run build        # compile to dist/
npm run dev          # recompile on save
npm test             # build + run tests
npm run inspect      # open the MCP Inspector UI against the server
```

## Using it from Claude Code

The repo's `.mcp.json` registers it as `mcp-playground` (runs `dist/server.js`, so build first).
After changing the server, rebuild and restart the session (or reconnect the server) to pick up changes.

## Adding a tool

```ts
server.registerTool(
  "my_tool",
  { description: "What it does", inputSchema: { q: z.string() } },
  async ({ q }) => ({ content: [{ type: "text", text: `got ${q}` }] }),
);
```

Then add a test in `src/test/server.test.ts`. Note: on stdio, never write to stdout — use `console.error`.
