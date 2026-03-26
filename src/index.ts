#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { LLMConveyors } from "llmconveyors";

import { registerAgentTools } from "./tools/agents.js";
import { registerAtsTools } from "./tools/ats.js";
import { registerResumeTools } from "./tools/resume.js";
import { registerUploadTools } from "./tools/upload.js";
import { registerSessionTools } from "./tools/sessions.js";
import { registerSettingsTools } from "./tools/settings.js";
import { registerContentTools } from "./tools/content.js";
import { registerSharesTools } from "./tools/shares.js";
import { registerDocumentTools } from "./tools/documents.js";
import { registerReferralTools } from "./tools/referral.js";
import { registerPrivacyTools } from "./tools/privacy.js";
import { registerHealthTools } from "./tools/health.js";

const apiKey = process.env.LLMC_API_KEY;
if (!apiKey) {
  console.error("LLMC_API_KEY environment variable is required");
  process.exit(1);
}

if (!apiKey.startsWith("llmc_")) {
  console.error("Warning: LLMC_API_KEY does not start with 'llmc_' — this may not be a valid LLM Conveyors API key.");
}

const baseUrl = process.env.LLMC_BASE_URL;
const client = new LLMConveyors({ apiKey, ...(baseUrl != null && { baseUrl }) });

const server = new McpServer({
  name: "llmconveyors",
  version: "0.3.0",
});

// Register all tool groups
registerAgentTools(server, client);
registerAtsTools(server, client);
registerResumeTools(server, client);
registerUploadTools(server, client);
registerSessionTools(server, client);
registerSettingsTools(server, client);
registerContentTools(server, client);
registerSharesTools(server, client);
registerDocumentTools(server, client);
registerReferralTools(server, client);
registerPrivacyTools(server, client);
registerHealthTools(server, client);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
