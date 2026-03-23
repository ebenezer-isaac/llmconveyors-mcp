import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";

export function registerDocumentTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "document-download",
    "Download a document by its storage path. Returns the file content or a download URL.",
    {
      path: z.string().describe("Document storage path"),
    },
    async (params) => {
      try {
        const response = await client.documents.download(params.path);
        const text = await response.text();
        return { content: [{ type: "text", text }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
