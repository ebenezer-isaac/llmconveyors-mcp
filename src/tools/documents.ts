import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerDocumentTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "document-download",
    "Download a document artifact by its storage path. Returns base64-encoded content for binary files (PDF, DOCX, images) or plain text for text files. Use this to retrieve generated artifacts like rendered resumes or reports when you have the storage path. For downloading artifacts from a specific session, use session-download instead (which takes a session ID and artifact key). Read-only, no side effects. Requires scope: sessions:read.",
    {
      path: z.string().describe("Document storage path"),
    },
    async (params) => {
      try {
        const response = await client.documents.download(params.path);
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
}
