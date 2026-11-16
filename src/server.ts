#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./createServer.js";

// stdio transport: stdout carries the protocol, so log to stderr only.
const server = createServer();
await server.connect(new StdioServerTransport());
console.error("mcp-playground running on stdio");
