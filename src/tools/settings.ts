import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";

export function registerSettingsTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "settings-profile",
    "Get the current user's profile. Returns email, name, plan, and credit balance.",
    {},
    async () => {
      try {
        const result = await client.settings.getProfile();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "settings-preferences-get",
    "Get the current user's preferences.",
    {},
    async () => {
      try {
        const result = await client.settings.getPreferences();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "settings-preferences-update",
    "Update the current user's preferences. Returns the updated preferences.",
    {
      preferences: z.record(z.unknown()).describe("Preferences object to update"),
    },
    async (params) => {
      try {
        const result = await client.settings.updatePreferences({
          preferences: params.preferences,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "settings-usage-summary",
    "Get a summary of the user's API usage and credit consumption.",
    {},
    async () => {
      try {
        const result = await client.settings.getUsageSummary();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "settings-usage-logs",
    "Get paginated usage logs. Returns individual usage entries with action, credits, and timestamps.",
    {
      offset: z.number().optional().describe("Offset for pagination"),
      limit: z.number().optional().describe("Number of entries to return"),
    },
    async (params) => {
      try {
        const result = await client.settings.getUsageLogs({
          offset: params.offset,
          limit: params.limit,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "api-key-create",
    "Create a new platform API key. The key value is shown ONLY in this response — save it immediately.",
    {
      label: z.string().describe("Human-readable label for the API key"),
      scopes: z.array(z.enum([
        "jobs:write", "jobs:read", "sales:write", "sales:read",
        "sessions:read", "sessions:write", "settings:read", "settings:write",
        "upload:write", "resume:read", "resume:write", "ats:write",
        "webhook:read", "webhook:write",
      ])).describe("Permission scopes for the key"),
    },
    async (params) => {
      try {
        const result = await client.settings.createApiKey({
          label: params.label,
          scopes: params.scopes,
        } as any);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "api-key-list",
    "List all platform API keys. Returns key metadata (hash, name, scopes) — NOT the key values.",
    {},
    async () => {
      try {
        const result = await client.settings.listApiKeys();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "api-key-revoke",
    "Revoke (delete) a platform API key by its hash.",
    {
      hash: z.string().describe("API key hash to revoke"),
    },
    async (params) => {
      try {
        await client.settings.revokeApiKey(params.hash);
        return { content: [{ type: "text", text: JSON.stringify({ revoked: true, hash: params.hash }) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "api-key-rotate",
    "Rotate a platform API key — revokes the old key and returns a new one. Save the new key immediately.",
    {
      hash: z.string().describe("API key hash to rotate"),
    },
    async (params) => {
      try {
        const result = await client.settings.rotateApiKey(params.hash);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "api-key-usage",
    "Get usage statistics for a specific API key by its hash.",
    {
      hash: z.string().describe("API key hash"),
    },
    async (params) => {
      try {
        const httpClient = (client.settings as any).httpClient;
        const result = await httpClient.request(
          `/settings/platform-api-keys/${encodeURIComponent(params.hash)}/usage`,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "byo-key-get",
    "Check if a Bring Your Own API key is configured and its status.",
    {},
    async () => {
      try {
        const result = await client.settings.getByoKey();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "byo-key-set",
    "Set a Bring Your Own API key for a provider (e.g. Gemini). Enables unlimited usage outside the credit system.",
    {
      apiKey: z.string().describe("The API key to set"),
      provider: z.string().describe("Provider name (e.g. gemini)"),
    },
    async (params) => {
      try {
        const result = await client.settings.setByoKey({
          apiKey: params.apiKey,
          provider: params.provider,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "byo-key-remove",
    "Remove the configured Bring Your Own API key.",
    {},
    async () => {
      try {
        await client.settings.removeByoKey();
        return { content: [{ type: "text", text: JSON.stringify({ removed: true }) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "webhook-secret-get",
    "Get the current webhook secret for verifying webhook signatures.",
    {},
    async () => {
      try {
        const result = await client.settings.getWebhookSecret();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "webhook-secret-rotate",
    "Rotate the webhook secret. The old secret remains valid for a grace period.",
    {},
    async () => {
      try {
        const result = await client.settings.rotateWebhookSecret();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
