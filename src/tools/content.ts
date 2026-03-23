import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";

export function registerContentTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "content-save",
    "Save a source document for use as context in AI generation. Returns success status.",
    {
      docType: z.enum([
        "original_cv", "extensive_cv", "cover_letter",
        "cv_strategy", "cover_letter_strategy", "cold_email_strategy",
        "recon_strategy", "company_context",
      ]).describe("Type of source document"),
      content: z.string().describe("Document content text"),
    },
    async (params) => {
      try {
        const result = await client.content.save({
          docType: params.docType,
          content: params.content,
        } as any);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "content-delete-generation",
    "Delete a generation and all its artifacts from a session.",
    {
      id: z.string().describe("Generation ID to delete"),
      sessionId: z.string().describe("Session ID that owns the generation"),
    },
    async (params) => {
      try {
        // SDK doesn't pass sessionId as query param — use underlying HTTP client
        const httpClient = (client.content as any).httpClient;
        const result = await httpClient.request(
          `/content/generations/${encodeURIComponent(params.id)}`,
          { method: "DELETE", query: { sessionId: params.sessionId } },
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
