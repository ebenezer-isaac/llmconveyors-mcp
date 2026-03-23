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
      name: z.string().describe("Human-readable name for the API key"),
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
          name: params.name,
          scopes: params.scopes,
        });
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
}
