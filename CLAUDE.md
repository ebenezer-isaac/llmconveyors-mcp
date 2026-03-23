# @llmconveyors/mcp-server

MCP server that exposes all LLM Conveyors platform capabilities as tools for AI agents (Claude Code, Claude Desktop, Cursor, etc.).

## Architecture

- **Protocol**: Model Context Protocol (MCP) via `@modelcontextprotocol/sdk`
- **Transport**: stdio (standard for MCP servers)
- **SDK**: Uses the `llmconveyors` npm package (TypeScript SDK) as the API client
- **Auth**: `LLMC_API_KEY` env var (prefix `llmc_`)

## Project Structure

```
src/
  index.ts              — Entry point: creates MCP server, wires up all tool groups
  tools/
    agents.ts           — FULLY IMPLEMENTED (pattern to follow for all others)
    ats.ts              — FULLY IMPLEMENTED
    resume.ts           — Stub (TODO)
    upload.ts           — Stub (TODO)
    sessions.ts         — Stub (TODO)
    settings.ts         — Stub (TODO)
    content.ts          — Stub (TODO)
    shares.ts           — Stub (TODO)
    documents.ts        — Stub (TODO)
```

## How to implement a tool

Follow the exact pattern in `src/tools/agents.ts` and `src/tools/ats.ts`:

1. Each tool file exports a `register*Tools(server, client)` function
2. Call `server.tool(name, description, zodSchema, handler)` for each tool
3. The handler receives validated params, calls the SDK client, returns MCP content
4. Always wrap in try/catch, return `{ isError: true }` on failure
5. Use `z.record(z.unknown())` for complex JSON objects the user provides
6. Return JSON.stringify'd results as text content

## Complete tool list to implement

Reference the `llmconveyors` SDK types (node_modules/llmconveyors/dist/index.d.ts) for exact method signatures.

### agents.ts (DONE)
- [x] `job-hunter-run` → `client.agents.run('job-hunter', ...)`
- [x] `b2b-sales-run` → `client.agents.run('b2b-sales', ...)`
- [x] `agent-status` → `client.agents.getStatus(...)`
- [x] `agent-manifest` → `client.agents.getManifest(...)`

### ats.ts (DONE)
- [x] `ats-score` → `client.ats.score(...)`

### resume.ts
- [ ] `resume-validate` → `client.resume.validate(body)`
- [ ] `resume-render` → `client.resume.render(body)` — returns PDF URL
- [ ] `resume-preview` → `client.resume.preview(body)` — returns HTML
- [ ] `resume-themes` → `client.resume.themes()` — no params
- [ ] `resume-import-rx` → `client.resume.importRxResume(body)`
- [ ] `resume-export-rx` → `client.resume.exportRxResume(body)`
- [ ] `master-resume-create` → `client.resume.createMaster(body)`
- [ ] `master-resume-list` → `client.resume.listMasters()` — no params
- [ ] `master-resume-get` → `client.resume.getMaster(id)`
- [ ] `master-resume-update` → `client.resume.updateMaster(id, body)`
- [ ] `master-resume-delete` → `client.resume.deleteMaster(id)`

### upload.ts
- [ ] `upload-job-text` → `client.upload.jobText({ text, source? })`

Note: `upload-resume` and `upload-job-file` require file bytes. MCP tools receive JSON params, so accept base64-encoded file content as a string param, decode to Buffer, then pass to the SDK. Example:
```ts
const buffer = Buffer.from(params.fileBase64, "base64");
await client.upload.resume(buffer, { filename: params.filename });
```

### sessions.ts
- [ ] `session-create` → `client.sessions.create({ agentType, metadata? })`
- [ ] `session-list` → `client.sessions.list({ page?, limit?, agentType? })`
- [ ] `session-get` → `client.sessions.get(id)`
- [ ] `session-hydrate` → `client.sessions.hydrate(id)` — full session with artifacts
- [ ] `session-delete` → `client.sessions.delete(id)`

### settings.ts
- [ ] `settings-profile` → `client.settings.getProfile()`
- [ ] `settings-preferences-get` → `client.settings.getPreferences()`
- [ ] `settings-preferences-update` → `client.settings.updatePreferences({ preferences })`
- [ ] `settings-usage-summary` → `client.settings.getUsageSummary()`
- [ ] `settings-usage-logs` → `client.settings.getUsageLogs({ offset?, limit? })`
- [ ] `api-key-create` → `client.settings.createApiKey({ name, scopes })`
- [ ] `api-key-list` → `client.settings.listApiKeys()`
- [ ] `api-key-revoke` → `client.settings.revokeApiKey(hash)`
- [ ] `api-key-rotate` → `client.settings.rotateApiKey(hash)`

### content.ts
- [ ] `content-save` → `client.content.save(body)`
- [ ] `content-delete-generation` → `client.content.deleteGeneration(id)`

### shares.ts
- [ ] `share-create` → `client.shares.create(body)`
- [ ] `share-stats` → `client.shares.getStats()`
- [ ] `share-get-public` → `client.shares.getPublic(slug)`

### documents.ts
- [ ] `document-download` → `client.documents.download(path)` — returns file URL/content

## Tool naming convention
- Kebab-case: `resource-action` (e.g., `master-resume-create`, `ats-score`)
- Group by resource, not by HTTP method
- Description should explain what the tool does and what it returns

## Build & test

```bash
npm install
npm run build
# Test locally:
LLMC_API_KEY=llmc_test node dist/index.js
```

## How users install this

```json
{
  "mcpServers": {
    "llmconveyors": {
      "command": "npx",
      "args": ["-y", "@llmconveyors/mcp-server"],
      "env": { "LLMC_API_KEY": "llmc_..." }
    }
  }
}
```

## Publishing

```bash
npm login --scope=@llmconveyors
npm publish --access public
```

## Rules
- One tool per SDK method — no composite mega-tools
- Every tool must have a clear description explaining what it does and returns
- Validate inputs with zod schemas matching the SDK types
- Never hardcode API keys — always from LLMC_API_KEY env var
- Return full API responses as JSON text, let the AI agent interpret them
- File uploads: accept base64 string, decode to Buffer
