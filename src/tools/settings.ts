import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerSettingsTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "settings-profile",
    "Get the current user's profile including email, name, subscription plan, and remaining credit balance. Use this to check available credits before running agents (job-hunter-run, b2b-sales-run) or to verify account identity. Read-only, no side effects. Requires scope: settings:read. For detailed usage breakdown, use settings-usage-summary instead.",
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
    "Get the current user's preferences, optionally filtered by agent type. Returns configuration like default themes, generation settings, and notification preferences. Read-only, no side effects. Requires scope: settings:read. Use settings-preferences-update to modify preferences.",
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
    "Update the current user's preferences, optionally scoped to a specific agent type. Modifies stored preferences and returns the updated values. Use this to configure default themes, generation settings, or notification preferences. Requires scope: settings:write. Use settings-preferences-get first to see current values before updating.",
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
    "Get an aggregate summary of the user's API usage and credit consumption, including total credits used, remaining balance, and usage by category. Use this to check credit balance before running agents or to monitor spending. Read-only, no side effects. Requires scope: settings:read. For individual usage entries with timestamps, use settings-usage-logs instead.",
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
    "Get paginated usage logs showing individual entries with action type, credits consumed, and timestamps. Use this to audit specific credit charges or investigate unexpected usage. Read-only, no side effects. Requires scope: settings:read. For an aggregate overview, use settings-usage-summary instead.",
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
    "Create a new platform API key with specified permission scopes. The key value is returned ONLY in this response and cannot be retrieved later, so save it immediately. Creates a new key record. Requires scope: settings:write. Use api-key-list to see existing keys. Use api-key-revoke to delete keys you no longer need.",
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
    "List all platform API keys for the current user. Returns key metadata (hash, label, scopes, creation date) but NOT the actual key values (those are only shown at creation time). Use this to find key hashes for revocation, rotation, or usage queries. Read-only, no side effects. Requires scope: settings:read.",
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
    "Permanently revoke and delete a platform API key by its hash. The key immediately stops working for all API calls. This is irreversible. Use this to remove compromised or unused keys. Requires scope: settings:write. Use api-key-list first to find the key hash. For replacing a key with a new one, use api-key-rotate instead.",
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
    "Rotate a platform API key by revoking the old key and issuing a new one. The new key value is returned ONLY in this response, so save it immediately. An optional grace period keeps the old key valid during transition. Use this for periodic key rotation or when a key may be compromised but you need continuity. Requires scope: settings:write. For immediate revocation without replacement, use api-key-revoke instead.",
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
    "Get usage statistics for a specific API key by its hash, including request counts and credit consumption. Use this to monitor per-key usage or identify which key is consuming the most credits. Read-only, no side effects. Requires scope: settings:read. Use api-key-list to find key hashes.",
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
    "Check the configuration status of all Bring Your Own (BYO) API keys. Returns each provider name and whether a key is configured. Use this to verify BYO key setup before running agents with tier=byo. Read-only, no side effects. Requires scope: settings:read. Use settings-supported-providers to see which providers are available. Use byo-key-set to configure a key.",
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
    "Configure a Bring Your Own (BYO) API key for an AI provider (e.g. gemini). BYO tier users get unlimited AI generation but still pay for contact enrichment credits. Stores the key securely on the platform. Requires scope: settings:write. Use settings-supported-providers to see available providers. Use byo-key-get to check current configuration. Use byo-key-remove to delete a configured key.",
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
    "Remove a configured Bring Your Own (BYO) API key for a provider. After removal, agent runs will use platform credits instead of the BYO key. Requires scope: settings:write. Use byo-key-get to check which providers have keys configured before removing.",
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
    "List all AI providers that support Bring Your Own (BYO) API keys, including provider names and availability status. Use this to discover which providers can be configured with byo-key-set before setting up BYO keys. Read-only, no side effects. Requires scope: settings:read.",
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
    "Get the current webhook signing secret used to verify webhook payloads from the LLM Conveyors platform. Use this when setting up webhook receivers to validate that incoming webhooks are authentic. Read-only, no side effects. Requires scope: webhook:read. Use webhook-secret-rotate to generate a new secret if the current one is compromised.",
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
    "Rotate the webhook signing secret, generating a new one and immediately invalidating the old secret. All existing webhook receivers must be updated with the new secret or they will reject incoming payloads. Rate limited: 5 per hour. Requires scope: webhook:write. Use webhook-secret-get to retrieve the current secret before rotating.",
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
