import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerSettingsTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "settings-profile",
    "Get the current user's profile. Returns email, name, plan, and credit balance. Requires scope: settings:read.",
    {},
    async () => {
      try {
        const result = await client.settings.getProfile();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "settings-preferences-get",
    "Get the current user's preferences. Requires scope: settings:read.",
    {
      agentType: z.string().optional().describe("Filter preferences by agent type (e.g. job-hunter, b2b-sales)"),
    },
    async (params) => {
      try {
        const result = await client.settings.getPreferences(
          params.agentType != null ? { agentType: params.agentType } as Parameters<typeof client.settings.getPreferences>[0] : undefined,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "settings-preferences-update",
    "Update the current user's preferences. Returns the updated preferences. Requires scope: settings:write.",
    {
      preferences: z.record(z.unknown()).describe("Preferences object to update"),
      agentType: z.string().optional().describe("Agent type to scope preferences to (e.g. job-hunter, b2b-sales)"),
    },
    async (params) => {
      try {
        const result = await client.settings.updatePreferences(
          params.preferences as Parameters<typeof client.settings.updatePreferences>[0],
          params.agentType != null ? { agentType: params.agentType } as Parameters<typeof client.settings.updatePreferences>[1] : undefined,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "settings-usage-summary",
    "Get a summary of the user's API usage and credit consumption. Requires scope: settings:read.",
    {},
    async () => {
      try {
        const result = await client.settings.getUsageSummary();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "settings-usage-logs",
    "Get paginated usage logs. Returns individual usage entries with action, credits, and timestamps. Requires scope: settings:read.",
    {
      offset: z.number().optional().describe("Offset for pagination"),
      limit: z.number().max(100).optional().describe("Number of entries to return (max 100)"),
    },
    async (params) => {
      try {
        const result = await client.settings.getUsageLogs({
          offset: params.offset,
          limit: params.limit,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "api-key-create",
    "Create a new platform API key. The key value is shown ONLY in this response -- save it immediately. Requires scope: settings:write.",
    {
      label: z.string().describe("Human-readable label for the API key"),
      scopes: z.array(z.enum([
        "*",
        "jobs:write", "jobs:read", "sales:write", "sales:read",
        "sessions:read", "sessions:write", "settings:read", "settings:write",
        "upload:write", "resume:read", "resume:write", "ats:write",
        "webhook:read", "webhook:write", "outreach:read", "outreach:write",
      ])).describe("Permission scopes for the key. Use '*' for all scopes."),
      expiresAt: z.string().optional().describe("Expiration date as ISO 8601 string"),
      monthlyCreditsLimit: z.number().optional().describe("Monthly credit usage cap for this key"),
    },
    async (params) => {
      try {
        const result = await client.settings.createApiKey({
          label: params.label,
          scopes: params.scopes,
          ...(params.expiresAt != null && { expiresAt: params.expiresAt }),
          ...(params.monthlyCreditsLimit != null && { monthlyCreditsLimit: params.monthlyCreditsLimit }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "api-key-list",
    "List all platform API keys. Returns key metadata (hash, name, scopes) -- NOT the key values. Requires scope: settings:read.",
    {},
    async () => {
      try {
        const result = await client.settings.listApiKeys();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "api-key-revoke",
    "Revoke (delete) a platform API key by its hash. Requires scope: settings:write.",
    {
      hash: z.string().describe("API key hash to revoke"),
    },
    async (params) => {
      try {
        await client.settings.revokeApiKey(params.hash);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: "API key revoked", hash: params.hash }) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "api-key-rotate",
    "Rotate a platform API key -- revokes the old key and returns a new one. Save the new key immediately. Requires scope: settings:write.",
    {
      hash: z.string().describe("API key hash to rotate"),
      gracePeriodHours: z.number().optional().describe("Hours the old key remains valid after rotation (default: 24)"),
    },
    async (params) => {
      try {
        const result = await client.settings.rotateApiKey(
          params.hash,
          params.gracePeriodHours != null ? { gracePeriodHours: params.gracePeriodHours } : undefined,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "api-key-usage",
    "Get usage statistics for a specific API key by its hash. Requires scope: settings:read.",
    {
      hash: z.string().describe("API key hash"),
    },
    async (params) => {
      try {
        const result = await client.settings.getApiKeyUsage(params.hash);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "byo-key-get",
    "Get the status of all configured BYO provider keys. Returns provider names and their configuration status. Requires scope: settings:read.",
    {},
    async () => {
      try {
        const result = await client.settings.getProviderKeyStatus();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "byo-key-set",
    "Set a Bring Your Own API key for a provider (e.g. gemini). BYO tier users get unlimited AI generation but still pay for contact enrichment. Requires scope: settings:write.",
    {
      provider: z.string().describe("Provider name (e.g. gemini)"),
      apiKey: z.string().describe("The API key to set"),
      baseUrl: z.string().optional().describe("Optional custom base URL for the provider"),
    },
    async (params) => {
      try {
        const result = await client.settings.setProviderKey(params.provider, {
          apiKey: params.apiKey,
          ...(params.baseUrl != null && { baseUrl: params.baseUrl }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "byo-key-remove",
    "Remove the configured BYO API key for a provider. Requires scope: settings:write.",
    {
      provider: z.string().describe("Provider name to remove the key for (e.g. gemini)"),
    },
    async (params) => {
      try {
        const result = await client.settings.removeProviderKey(params.provider);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "settings-supported-providers",
    "List supported BYO key providers. Returns provider names and status. Requires scope: settings:read.",
    {},
    async () => {
      try {
        const result = await client.settings.getSupportedProviders();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "webhook-secret-get",
    "Get the current webhook secret for verifying webhook signatures. Requires scope: webhook:read.",
    {},
    async () => {
      try {
        const result = await client.settings.getWebhookSecret();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "webhook-secret-rotate",
    "Rotate the webhook secret. Returns the new secret. The old secret is immediately invalidated. Rate limited: 5 per hour. Requires scope: webhook:write.",
    {},
    async () => {
      try {
        const result = await client.settings.rotateWebhookSecret();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
