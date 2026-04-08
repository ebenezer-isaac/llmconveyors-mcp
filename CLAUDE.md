# llmconveyors-mcp

MCP server that exposes all LLM Conveyors platform capabilities as 66 tools for AI agents (Claude Code, Claude Desktop, Cursor, etc.).

## Architecture

- **Protocol**: Model Context Protocol (MCP) via `@modelcontextprotocol/sdk`
- **Transport**: stdio (standard for MCP servers)
- **SDK**: Uses the `llmconveyors` npm package (TypeScript SDK) as the API client
- **Auth**: `LLMC_API_KEY` env var (prefix `llmc_`)
- **Base URL override**: Optional `LLMC_BASE_URL` env var

## Project Structure

```
src/
  index.ts              — Entry point: creates MCP server, wires up all 12 tool groups
  utils/
    error-handler.ts    — Shared error handler (LLMConveyorsError, RateLimitError, NetworkError, TimeoutError)
  tools/
    agents.ts           — FULLY IMPLEMENTED (6 tools)
    ats.ts              — FULLY IMPLEMENTED (1 tool)
    resume.ts           — FULLY IMPLEMENTED (10 tools)
    upload.ts           — FULLY IMPLEMENTED (3 tools)
    sessions.ts         — FULLY IMPLEMENTED (9 tools)
    settings.ts         — FULLY IMPLEMENTED (16 tools)
    content.ts          — FULLY IMPLEMENTED (6 tools)
    shares.ts           — FULLY IMPLEMENTED (4 tools)
    documents.ts        — FULLY IMPLEMENTED (1 tool)
    referral.ts         — FULLY IMPLEMENTED (3 tools)
    privacy.ts          — FULLY IMPLEMENTED (3 tools)
    health.ts           — FULLY IMPLEMENTED (4 tools)
```

## Shared Utilities

### `src/utils/error-handler.ts`

All tool handlers use `handleToolError(err)` instead of inline try/catch formatting. It:

- Extracts structured fields from `LLMConveyorsError` (code, statusCode, hint, details, requestId, retryable, timestamp, path)
- Extracts `retryAfterSeconds`, `retryAfterMs`, and `rateLimitInfo` from `RateLimitError`
- Handles `NetworkError` and `TimeoutError` with `retryable: true` signal
- Falls back to plain error message for unknown errors
- Always returns `{ content, isError: true }` in MCP format

## How to implement a tool

Follow the pattern established across all tool files:

1. Each tool file exports a `register*Tools(server, client)` function
2. Call `server.tool(name, description, zodSchema, handler)` for each tool
3. The handler receives validated params, calls the SDK client, returns MCP content
4. Always wrap in try/catch, use `handleToolError(err)` from `src/utils/error-handler.ts`
5. Use `z.record(z.unknown())` for complex JSON objects the user provides
6. Return JSON.stringify'd results as text content

## Complete tool list (66 tools)

Reference the `llmconveyors` SDK types (node_modules/llmconveyors/dist/index.d.ts) for exact method signatures.

### agents.ts (DONE - 6 tools)
- [x] `job-hunter-run` - Run the Job Hunter agent
- [x] `b2b-sales-run` - Run the B2B Sales agent
- [x] `agent-status` - Get agent run status
- [x] `agent-interact` - Send interaction to a running agent
- [x] `job-hunter-generate-cv` - Generate a tailored CV
- [x] `agent-manifest` - Get agent manifest/capabilities

### ats.ts (DONE - 1 tool)
- [x] `ats-score` - Score a resume against a job description

### resume.ts (DONE - 10 tools)
- [x] `resume-parse` - Parse a resume from uploaded file
- [x] `resume-validate` - Validate resume data
- [x] `resume-render` - Render resume to PDF (returns URL)
- [x] `resume-preview` - Preview resume as HTML
- [x] `resume-themes` - List available resume themes
- [x] `resume-import-rx` - Import from Reactive Resume format
- [x] `resume-export-rx` - Export to Reactive Resume format
- [x] `master-resume-get` - Get the user's master resume (singleton)
- [x] `master-resume-upsert` - Create or replace the user's master resume (singleton)
- [x] `master-resume-delete` - Delete the user's master resume (singleton)

### upload.ts (DONE - 3 tools)
- [x] `upload-resume` - Upload a resume file (base64-encoded)
- [x] `upload-job-file` - Upload a job description file (base64-encoded)
- [x] `upload-job-text` - Upload job description as plain text

### sessions.ts (DONE - 9 tools)
- [x] `session-create` - Create a new agent session
- [x] `session-list` - List sessions with cursor-based pagination
- [x] `session-get` - Get session by ID
- [x] `session-hydrate` - Get full session with all artifacts
- [x] `session-download` - Download session artifacts
- [x] `session-delete` - Delete a session
- [x] `session-init` - Initialize a session
- [x] `session-log` - Log an event to a session
- [x] `session-stats` - Get session statistics

### settings.ts (DONE - 16 tools)
- [x] `settings-profile` - Get user profile
- [x] `settings-preferences-get` - Get user preferences
- [x] `settings-preferences-update` - Update user preferences
- [x] `settings-usage-summary` - Get usage summary
- [x] `settings-usage-logs` - Get usage logs with pagination
- [x] `api-key-create` - Create a new API key
- [x] `api-key-list` - List all API keys
- [x] `api-key-revoke` - Revoke an API key
- [x] `api-key-rotate` - Rotate an API key
- [x] `api-key-usage` - Get usage stats for an API key
- [x] `byo-key-get` - Get BYO provider key status
- [x] `byo-key-set` - Set a BYO provider key
- [x] `byo-key-remove` - Remove a BYO provider key
- [x] `webhook-secret-get` - Get webhook signing secret
- [x] `webhook-secret-rotate` - Rotate webhook signing secret
- [x] `settings-supported-providers` - List supported BYO key providers

### content.ts (DONE - 6 tools)
- [x] `content-save` - Save generated content
- [x] `content-delete-generation` - Delete a content generation
- [x] `content-research-sender` - Research a sender for outreach
- [x] `content-list-sources` - List content sources
- [x] `content-get-source` - Get a content source by ID
- [x] `content-delete-source` - Delete a content source

### shares.ts (DONE - 4 tools)
- [x] `share-create` - Create a shareable link
- [x] `share-stats` - Get sharing stats for current user
- [x] `share-get-public` - Get a public share by slug
- [x] `share-slug-stats` - Get view stats for a specific share slug

### documents.ts (DONE - 1 tool)
- [x] `document-download` - Download a document by path

### referral.ts (DONE - 3 tools)
- [x] `referral-stats` - Get referral stats
- [x] `referral-code` - Get referral code
- [x] `referral-vanity-code` - Set a vanity referral code

### privacy.ts (DONE - 3 tools)
- [x] `privacy-list-consents` - List all consent records
- [x] `privacy-grant-consent` - Grant consent for a purpose
- [x] `privacy-revoke-consent` - Revoke consent for a purpose

### health.ts (DONE - 4 tools)
- [x] `health-root` - Root health endpoint
- [x] `health-check` - Detailed health check
- [x] `health-ready` - Readiness probe
- [x] `health-live` - Liveness probe

## SDK Bypasses

None — all tools now use the public SDK surface directly (as of v0.3.1 / SDK v0.3.0).

## Intentional Omissions

The following SDK capabilities are intentionally not exposed as MCP tools:

- **Streaming (SSE)**: MCP stdio transport is incompatible with server-sent events. Agent runs that support streaming use polling via `agent-status` instead.
- **Auth export/delete**: Session-only operations that always return 403 in API-key-authenticated context.
- **Client-side logging/telemetry**: These are client-side SDK concerns, not server-side tool operations.
- **Outreach API**: Internal endpoints not exposed in the SDK. Documented in API docs as a leak — to be removed.
- **`shares.recordVisit`**: Requires Cloudflare Turnstile browser token, not usable from MCP.
- **Webhook signature verification**: Client-side utility function (`verifyWebhookSignature`), not an API endpoint.

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
      "args": ["-y", "llmconveyors-mcp"],
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
