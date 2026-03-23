# @llmconveyors/mcp-server

[![npm version](https://img.shields.io/npm/v/@llmconveyors/mcp-server.svg)](https://www.npmjs.com/package/@llmconveyors/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

MCP server that connects AI agents to the [LLM Conveyors](https://llmconveyors.com) platform — run Job Hunter, B2B Sales, and other AI agents directly from Claude, Cursor, or any MCP-compatible client.

<p align="center">
  <img src="https://llmconveyors.com/assets/logo.png" alt="LLM Conveyors" width="200" />
</p>

## What is LLM Conveyors?

A community-driven AI agent platform with pay-per-action pricing ($1–5 per completed action). Instead of $100/mo SaaS subscriptions, you pay only for real outputs — a resume scored, a company researched, a cold email generated.

**Live Agents:**
- **Job Hunter** — Tailored CVs, cover letters, and cold emails for job applications
- **B2B Sales** — Deep company research and personalized sales outreach

## Quick Start

### 1. Get an API key

Sign up at [llmconveyors.com](https://llmconveyors.com) and create an API key from Settings → API Keys.

### 2. Add to your MCP client

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "llmconveyors": {
      "command": "npx",
      "args": ["-y", "@llmconveyors/mcp-server"],
      "env": {
        "LLMC_API_KEY": "llmc_your_key_here"
      }
    }
  }
}
```
</details>

<details>
<summary><strong>Claude Code</strong></summary>

```bash
claude mcp add llmconveyors -- npx -y @llmconveyors/mcp-server
```

Set the env var in your shell or `.env`:
```bash
export LLMC_API_KEY=llmc_your_key_here
```
</details>

<details>
<summary><strong>Cursor</strong></summary>

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "llmconveyors": {
      "command": "npx",
      "args": ["-y", "@llmconveyors/mcp-server"],
      "env": {
        "LLMC_API_KEY": "llmc_your_key_here"
      }
    }
  }
}
```
</details>

<details>
<summary><strong>Windsurf</strong></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "llmconveyors": {
      "command": "npx",
      "args": ["-y", "@llmconveyors/mcp-server"],
      "env": {
        "LLMC_API_KEY": "llmc_your_key_here"
      }
    }
  }
}
```
</details>

### 3. Start using it

Ask your AI agent:

> "Run the Job Hunter agent for the Senior Engineer role at Anthropic. Here's the job description: ..."

> "Score my resume against this job posting for ATS compatibility."

> "Research Stripe and draft a B2B cold email for our developer tools product."

## Available Tools (39)

### Agents
| Tool | Description |
|------|-------------|
| `job-hunter-run` | Run the Job Hunter agent — generates tailored CV, cover letter, and cold email |
| `b2b-sales-run` | Run the B2B Sales agent — researches a company and generates sales outreach |
| `agent-status` | Check the status of a running agent job |
| `agent-manifest` | Get input fields, capabilities, and billing info for an agent |

### Resume
| Tool | Description |
|------|-------------|
| `resume-validate` | Validate a resume in JSON Resume format |
| `resume-render` | Render a resume to PDF |
| `resume-preview` | Preview a resume as HTML |
| `resume-themes` | List available resume themes |
| `resume-import-rx` | Import from Reactive Resume format |
| `resume-export-rx` | Export to Reactive Resume format |

### Master Resumes
| Tool | Description |
|------|-------------|
| `master-resume-create` | Create a new master resume |
| `master-resume-list` | List all master resumes |
| `master-resume-get` | Get a master resume by ID |
| `master-resume-update` | Update a master resume |
| `master-resume-delete` | Delete a master resume |

### Upload & Parse
| Tool | Description |
|------|-------------|
| `upload-resume` | Upload and parse a resume file (base64) |
| `upload-job-file` | Upload and parse a job description file (base64) |
| `upload-job-text` | Parse a job description from plain text |

### ATS Scoring
| Tool | Description |
|------|-------------|
| `ats-score` | Score a resume against a job description for ATS compatibility |

### Sessions
| Tool | Description |
|------|-------------|
| `session-create` | Create a new session |
| `session-list` | List sessions with optional filtering |
| `session-get` | Get a session by ID |
| `session-hydrate` | Get full session with artifacts and logs |
| `session-delete` | Delete a session |

### Settings & API Keys
| Tool | Description |
|------|-------------|
| `settings-profile` | Get user profile (credits, plan) |
| `settings-preferences-get` | Get user preferences |
| `settings-preferences-update` | Update user preferences |
| `settings-usage-summary` | Get usage summary |
| `settings-usage-logs` | Get paginated usage logs |
| `api-key-create` | Create a new API key |
| `api-key-list` | List all API keys |
| `api-key-revoke` | Revoke an API key |
| `api-key-rotate` | Rotate an API key |

### Content & Sharing
| Tool | Description |
|------|-------------|
| `content-save` | Save a source document for AI generation context |
| `content-delete-generation` | Delete a generation and its artifacts |
| `share-create` | Create a public share link for generated content |
| `share-stats` | Get share link statistics |
| `share-get-public` | Get a public share by slug |

### Documents
| Tool | Description |
|------|-------------|
| `document-download` | Download an artifact by storage path |

## API Key Scopes

Your API key needs the right scopes for the tools you want to use:

| Scope | Tools |
|-------|-------|
| `jobs:read` | `agent-status`, `agent-manifest` |
| `jobs:write` | `job-hunter-run` |
| `sales:write` | `b2b-sales-run` |
| `sessions:read` | `session-list`, `session-get`, `session-hydrate` |
| `sessions:write` | `session-create`, `session-delete` |
| `resume:read` | `resume-themes`, `master-resume-list`, `master-resume-get` |
| `resume:write` | `resume-validate`, `resume-render`, `resume-preview`, `resume-import-rx`, `resume-export-rx`, `master-resume-create`, `master-resume-update`, `master-resume-delete` |
| `upload:write` | `upload-resume`, `upload-job-file`, `upload-job-text` |
| `ats:write` | `ats-score` |
| `settings:read` | `settings-profile`, `settings-preferences-get`, `settings-usage-summary`, `settings-usage-logs`, `api-key-list` |
| `settings:write` | `settings-preferences-update`, `api-key-create`, `api-key-revoke`, `api-key-rotate` |

## Development

```bash
git clone https://github.com/llmconveyors/llmconveyors-mcp.git
cd llmconveyors-mcp
npm install
npm run build

# Test locally
LLMC_API_KEY=llmc_your_key node dist/index.js
```

## Requirements

- Node.js >= 18
- An LLM Conveyors API key ([get one here](https://llmconveyors.com))

## Links

- [LLM Conveyors Platform](https://llmconveyors.com)
- [API Documentation](https://llmconveyors.com/docs/api)
- [TypeScript SDK](https://www.npmjs.com/package/llmconveyors)

## License

MIT — see [LICENSE](LICENSE) for details.
