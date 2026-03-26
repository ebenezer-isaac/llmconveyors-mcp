# llmconveyors-mcp

[![npm version](https://img.shields.io/npm/v/llmconveyors-mcp.svg)](https://www.npmjs.com/package/llmconveyors-mcp)
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
      "args": ["-y", "llmconveyors-mcp"],
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
claude mcp add llmconveyors -- npx -y llmconveyors-mcp
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
      "args": ["-y", "llmconveyors-mcp"],
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
      "args": ["-y", "llmconveyors-mcp"],
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

## Available Tools (66)

### Agents
| Tool | Description |
|------|-------------|
| `job-hunter-run` | Run the Job Hunter agent — generates tailored CV, cover letter, and cold email |
| `b2b-sales-run` | Run the B2B Sales agent — researches a company and generates sales outreach |
| `agent-status` | Check the status of a running agent job |
| `agent-interact` | Submit a response to a phased agent workflow awaiting input |
| `job-hunter-generate-cv` | Generate a CV synchronously (faster, CV only) |
| `agent-manifest` | Get input fields, capabilities, and billing info for an agent |

### Resume
| Tool | Description |
|------|-------------|
| `resume-parse` | Parse a resume file into structured JSON Resume format |
| `resume-validate` | Validate a resume in JSON Resume format |
| `resume-render` | Render a resume to PDF or HTML |
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
| `upload-job-text` | Parse a job description from text or URL |

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
| `session-download` | Download an artifact from a session by storage key |
| `session-delete` | Delete a session |
| `session-init` | Initialize a session with agent context and configuration |
| `session-log` | Append a log entry to a session |

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
| `api-key-usage` | Get usage statistics for a specific API key |
| `byo-key-get` | Check if a Bring Your Own API key is configured |
| `byo-key-set` | Set a BYO API key for a provider (e.g. Gemini) |
| `byo-key-remove` | Remove the configured BYO API key |
| `webhook-secret-get` | Get the current webhook secret |
| `webhook-secret-rotate` | Rotate the webhook secret |

### Content & Sharing
| Tool | Description |
|------|-------------|
| `content-save` | Save a source document for AI generation context |
| `content-delete-generation` | Delete a generation and its artifacts |
| `content-research-sender` | Research a sender's background for personalized content |
| `content-list-sources` | List all saved source documents |
| `content-get-source` | Get a specific source document by ID |
| `content-delete-source` | Delete a saved source document |
| `share-create` | Create a public share link for generated content |
| `share-stats` | Get share link statistics |
| `share-get-public` | Get a public share by slug |
| `share-slug-stats` | Get visit statistics for a specific share link |

### Privacy
| Tool | Description |
|------|-------------|
| `privacy-list-consents` | List all consent records for the current user |
| `privacy-grant-consent` | Grant consent for a specific data processing purpose |
| `privacy-revoke-consent` | Revoke a previously granted consent |

### Referral
| Tool | Description |
|------|-------------|
| `referral-stats` | Get referral program statistics |
| `referral-code` | Get your referral code |
| `referral-vanity-code` | Set a custom vanity referral code |

### Documents
| Tool | Description |
|------|-------------|
| `document-download` | Download an artifact by storage path |

### Health
| Tool | Description |
|------|-------------|
| `health-root` | Get server info and version |
| `health-check` | Run a full health check on all dependencies |
| `health-ready` | Check if the server is ready to accept requests |
| `health-live` | Check if the server process is alive |

## API Key Scopes

Your API key needs the right scopes for the tools you want to use:

| Scope | Tools |
|-------|-------|
| `jobs:read` | `agent-status`, `agent-manifest` |
| `jobs:write` | `job-hunter-run`, `job-hunter-generate-cv` |
| `sales:write` | `b2b-sales-run` |
| `sessions:read` | `session-list`, `session-get`, `session-hydrate` |
| `sessions:write` | `session-create`, `session-delete`, `session-init`, `session-log` |
| `resume:read` | `resume-themes`, `master-resume-list`, `master-resume-get` |
| `resume:write` | `resume-validate`, `resume-render`, `resume-preview`, `resume-import-rx`, `resume-export-rx`, `master-resume-create`, `master-resume-update`, `master-resume-delete` |
| `upload:write` | `upload-resume`, `upload-job-file`, `upload-job-text` |
| `ats:write` | `ats-score` |
| `settings:read` | `settings-profile`, `settings-preferences-get`, `settings-usage-summary`, `settings-usage-logs`, `api-key-list` |
| `settings:write` | `settings-preferences-update`, `api-key-create`, `api-key-revoke`, `api-key-rotate` |
| `content:read` | `content-list-sources`, `content-get-source` |
| `content:write` | `content-save`, `content-delete-generation`, `content-research-sender`, `content-delete-source` |
| `privacy:read` | `privacy-list-consents` |
| `privacy:write` | `privacy-grant-consent`, `privacy-revoke-consent` |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LLMC_API_KEY` | Yes | Your LLM Conveyors API key (prefix `llmc_`) |
| `LLMC_BASE_URL` | No | Custom API endpoint (defaults to `https://api.llmconveyors.com`) |

## Development

```bash
git clone https://github.com/ebenezer-isaac/llmconveyors-mcp.git
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
