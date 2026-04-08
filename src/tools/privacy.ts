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
    "List all privacy consent records for the current user, showing each data processing purpose and whether consent is granted or revoked. Use this to check consent status before running tools that require specific consents (e.g. ai-generation, contact-enrichment). Read-only, no side effects. Requires scope: settings:read.",
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
    "Grant consent for a specific data processing purpose. This enables the platform to process data for that purpose (e.g. ai-generation enables agent runs, contact-enrichment enables contact lookups). Modifies the user's consent record. Requires scope: settings:write. Use privacy-list-consents to check current status first. Use privacy-revoke-consent to undo.",
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
    "Revoke a previously granted consent for a specific data processing purpose. This may disable platform features that depend on that consent (e.g. revoking ai-generation prevents agent runs). Modifies the user's consent record. Requires scope: settings:write. Use privacy-list-consents to check current status first.",
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
