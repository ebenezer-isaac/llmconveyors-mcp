import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";

export function registerSessionTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "session-create",
    "Create a new session. Returns the created session object with its ID.",
    {
      metadata: z.record(z.unknown()).optional().describe("Optional session metadata (e.g. agentType, source)"),
    },
    async (params) => {
      try {
        const result = await client.sessions.create({
          metadata: params.metadata,
        } as any);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "session-list",
    "List sessions with optional filtering and pagination. Returns an array of session objects.",
    {
      page: z.number().optional().describe("Page number for pagination"),
      limit: z.number().optional().describe("Number of sessions per page"),
      agentType: z.string().optional().describe("Filter by agent type"),
    },
    async (params) => {
      try {
        const result = await client.sessions.list({
          page: params.page,
          limit: params.limit,
          agentType: params.agentType,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "session-get",
    "Get a session by ID. Returns the session object with generation history.",
    {
      id: z.string().describe("Session ID"),
    },
    async (params) => {
      try {
        const result = await client.sessions.get(params.id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "session-hydrate",
    "Hydrate a session — returns the full session with all artifacts and logs.",
    {
      id: z.string().describe("Session ID"),
    },
    async (params) => {
      try {
        const result = await client.sessions.hydrate(params.id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "session-delete",
    "Delete a session by ID.",
    {
      id: z.string().describe("Session ID"),
    },
    async (params) => {
      try {
        await client.sessions.delete(params.id);
        return { content: [{ type: "text", text: JSON.stringify({ deleted: true, id: params.id }) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
