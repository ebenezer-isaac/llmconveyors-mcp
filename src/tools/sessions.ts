import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerSessionTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "session-create",
    "Create a new session. Returns the created session object with its ID. Requires scope: sessions:write.",
    {
      sessionId: z.string().optional().describe("Optional client-generated session ID"),
      metadata: z.record(z.unknown()).optional().describe("Optional session metadata"),
    },
    async (params) => {
      try {
        const result = await client.sessions.create({
          ...(params.sessionId != null && { sessionId: params.sessionId }),
          ...(params.metadata != null && { metadata: params.metadata }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "session-list",
    "List sessions with cursor-based pagination. Returns an array of session objects (or paginated envelope when limit is provided). Requires scope: sessions:read.",
    {
      cursor: z.string().optional().describe("Cursor for pagination (ISO 8601 datetime string)"),
      limit: z.number().min(1).max(50).optional().describe("Number of sessions per page (1-50)"),
    },
    async (params) => {
      try {
        const result = await client.sessions.list({
          ...(params.cursor != null && { cursor: params.cursor }),
          ...(params.limit != null && { limit: params.limit }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "session-get",
    "Get a session by ID. Returns the session object with generation history. Requires scope: sessions:read.",
    {
      id: z.string().describe("Session ID"),
    },
    async (params) => {
      try {
        const result = await client.sessions.get(params.id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "session-hydrate",
    "Hydrate a session — returns the full session with all artifacts and logs. Requires scope: sessions:read.",
    {
      id: z.string().describe("Session ID"),
    },
    async (params) => {
      try {
        const result = await client.sessions.hydrate(params.id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "session-download",
    "Download an artifact from a session by its storage key. Returns base64-encoded content for binary files (PDF, DOCX, images) or plain text for text files. Requires scope: sessions:read.",
    {
      id: z.string().describe("Session ID"),
      key: z.string().describe("Artifact storage key from session hydration"),
    },
    async (params) => {
      try {
        const response = await client.sessions.download(params.id, params.key);
        if (!response.ok) {
          return {
            content: [{ type: "text", text: `Error: HTTP ${response.status} ${response.statusText}` }],
            isError: true,
          };
        }
        const contentType = response.headers.get("content-type") ?? "";
        const isText = contentType.startsWith("text/") || contentType.includes("json");
        if (isText) {
          const text = await response.text();
          return { content: [{ type: "text", text }] };
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        const base64 = buffer.toString("base64");
        return {
          content: [{ type: "text", text: JSON.stringify({ contentType, encoding: "base64", data: base64 }) }],
        };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "session-delete",
    "Delete a session by ID. Requires scope: sessions:write.",
    {
      id: z.string().describe("Session ID"),
    },
    async (params) => {
      try {
        await client.sessions.delete(params.id);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: "Session deleted", sessionId: params.id }) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "session-init",
    "Initialize session configuration — returns default settings and capabilities. Requires scope: sessions:read.",
    {},
    async () => {
      try {
        const result = await client.sessions.init();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "session-log",
    "Append a log entry to a session. Used for tracking conversation history and tool usage. Requires scope: sessions:write.",
    {
      id: z.string().describe("Session ID"),
      role: z.enum(["user", "assistant", "system", "tool", "status"]).describe("Log entry role"),
      content: z.string().optional().describe("Log entry content text"),
      payload: z.record(z.unknown()).optional().describe("Structured log entry data"),
    },
    async (params) => {
      try {
        const result = await client.sessions.log(params.id, {
          role: params.role,
          ...(params.content != null && { content: params.content }),
          ...(params.payload != null && { payload: params.payload }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "session-stats",
    "Get session statistics (total sessions, active sequences, emails drafted, reply rate, credits used). Requires scope: sessions:read.",
    {
      agentType: z.enum(["job-hunter", "b2b-sales"]).describe("Agent type to get stats for"),
    },
    async (params) => {
      try {
        const result = await client.sessions.stats({
          agentType: params.agentType,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
