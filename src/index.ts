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

const apiKey = process.env.LLMC_API_KEY;
if (!apiKey) {
  console.error("LLMC_API_KEY environment variable is required");
  process.exit(1);
}

const client = new LLMConveyors({ apiKey });

const server = new McpServer({
  name: "llmconveyors",
  version: "0.2.1",
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

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
