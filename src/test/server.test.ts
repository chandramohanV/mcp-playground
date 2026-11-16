import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../createServer.js";

const client = new Client({ name: "test-client", version: "0.0.0" });

before(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await createServer().connect(serverTransport);
  await client.connect(clientTransport);
});

after(() => client.close());

const text = (r: any) => r.content[0].text as string;

test("lists the tools", async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ["add", "current_time", "echo"]);
});

test("echo returns its input", async () => {
  const r = await client.callTool({ name: "echo", arguments: { text: "hi" } });
  assert.equal(text(r), "hi");
});

test("add returns structured content", async () => {
  const r = await client.callTool({ name: "add", arguments: { a: 2, b: 3 } });
  assert.deepEqual(r.structuredContent, { sum: 5 });
});

test("current_time flags a bad time zone as an error", async () => {
  const r = await client.callTool({ name: "current_time", arguments: { timeZone: "Nope/Nowhere" } });
  assert.equal(r.isError, true);
});

test("reads a templated resource", async () => {
  const r = await client.readResource({ uri: "greeting://Ada" });
  assert.equal((r.contents[0] as any).text, "Hello, Ada!");
});

test("gets a prompt", async () => {
  const r = await client.getPrompt({ name: "review_code", arguments: { code: "x = 1" } });
  assert.match((r.messages[0].content as any).text, /x = 1/);
});
