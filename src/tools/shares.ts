import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";

export function registerSharesTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "share-create",
    "Create a shareable public link for a generation's artifacts. Returns a slug and public URL.",
    {
      sessionId: z.string().describe("Session ID containing the generation"),
      generationId: z.string().describe("Generation ID to share"),
    },
    async (params) => {
      try {
        const result = await client.shares.create({
          sessionId: params.sessionId,
          generationId: params.generationId,
        } as any);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "share-stats",
    "Get statistics about your shared links (view counts, etc.).",
    {},
    async () => {
      try {
        const result = await client.shares.getStats();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "share-get-public",
    "Get a publicly shared resource by its slug.",
    {
      slug: z.string().describe("Public share slug"),
    },
    async (params) => {
      try {
        const result = await client.shares.getPublic(params.slug);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
