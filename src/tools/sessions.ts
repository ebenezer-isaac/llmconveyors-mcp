import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerSessionTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "session-create",
    "Create a new session for grouping agent runs and their artifacts. Returns the session object with its ID. Sessions organize multiple generations (agent runs) into a logical workspace. Use this before running job-hunter-run or b2b-sales-run with a specific sessionId. Requires scope: sessions:write.",
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
    "List sessions with cursor-based pagination. Returns session objects with IDs, creation dates, and metadata. Use this to browse existing sessions or find a session to resume. When limit is provided, returns a paginated envelope with a cursor for the next page. Read-only, no side effects. Requires scope: sessions:read. Use session-get or session-hydrate to get full details for a specific session.",
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
    "Get a session by ID, returning the session object with its generation history (list of agent runs). Use this to check what generations exist in a session without loading full artifacts. Read-only, no side effects. Requires scope: sessions:read. For full session data including all artifacts and logs, use session-hydrate instead.",
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
    "Load a session with all its artifacts, logs, and generation details. Returns the complete session state including generated CVs, cover letters, emails, and conversation history. Use this to review full agent outputs or prepare artifacts for download. Heavier than session-get, so prefer session-get for lightweight lookups. Read-only, no side effects. Requires scope: sessions:read.",
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
    "Download a specific artifact from a session by its storage key. Returns base64-encoded content for binary files (PDF, DOCX, images) or plain text for text files. Use this to retrieve individual generated files like a rendered PDF resume or cover letter. Get artifact keys from session-hydrate first. Read-only, no side effects. Requires scope: sessions:read. For downloading by storage path instead of session context, use document-download.",
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
    "Permanently delete a session and all its generations, artifacts, and logs. This is irreversible. Use this to clean up completed or unwanted sessions. Requires scope: sessions:write. Use session-list to find sessions, and session-hydrate to review contents before deleting.",
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
    "Get the default session configuration, including available agent types, supported features, and default settings. Use this to discover what agents and capabilities are available before creating sessions. Read-only, no side effects. Requires scope: sessions:read.",
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
    "Append a log entry to an existing session for tracking conversation history, tool usage, or status updates. Creates a new log record in the session. Use this to maintain an audit trail of actions taken during a session. Requires scope: sessions:write. Use session-hydrate to read back the full log history.",
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
    "Get aggregate session statistics for an agent type, including total sessions, active sequences, emails drafted, reply rate, and credits consumed. Use this to review overall usage and performance metrics for job-hunter or b2b-sales workflows. Read-only, no side effects. Requires scope: sessions:read.",
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
