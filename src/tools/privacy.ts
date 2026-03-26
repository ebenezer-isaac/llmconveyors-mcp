import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

// NOTE: privacy-export-data and privacy-delete-account are intentionally omitted.
// Both require session-only auth (cannot work with API keys) and delete-account
// is a destructive operation unsuitable for MCP tool exposure.

const CONSENT_PURPOSES = [
  "account",
  "resume-processing",
  "ai-generation",
  "contact-enrichment",
  "analytics",
  "email-outreach",
] as const;

export function registerPrivacyTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "privacy-list-consents",
    "List all privacy consent statuses for the current user. Returns consent purposes and their granted/revoked status. Requires scope: settings:read.",
    {},
    async () => {
      try {
        const result = await client.privacy.listConsents();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "privacy-grant-consent",
    "Grant consent for a specific data processing purpose. Requires scope: settings:write.",
    {
      purpose: z.enum(CONSENT_PURPOSES).describe("Consent purpose to grant"),
    },
    async (params) => {
      try {
        const result = await client.privacy.grantConsent(params.purpose);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "privacy-revoke-consent",
    "Revoke consent for a specific data processing purpose. Requires scope: settings:write.",
    {
      purpose: z.enum(CONSENT_PURPOSES).describe("Consent purpose to revoke"),
    },
    async (params) => {
      try {
        const result = await client.privacy.revokeConsent(params.purpose);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
