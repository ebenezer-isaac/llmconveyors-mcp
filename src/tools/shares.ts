import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerSharesTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "share-create",
    "Create a shareable public link for a generation's artifacts. Returns a slug and public URL. Requires scope: sessions:write.",
    {
      sessionId: z.string().describe("Session ID containing the generation"),
      generationId: z.string().describe("Generation ID to share"),
    },
    async (params) => {
      try {
        const result = await client.shares.create({
          sessionId: params.sessionId,
          generationId: params.generationId,
        } as unknown as Parameters<typeof client.shares.create>[0]); // SDK type is Record<string, unknown>, but API accepts typed fields
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "share-stats",
    "Get statistics about your shared links (view counts, etc.). Requires scope: settings:read.",
    {},
    async () => {
      try {
        const result = await client.shares.getStats();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "share-get-public",
    "Get a publicly shared resource by its slug. No auth required (public endpoint).",
    {
      slug: z.string().describe("Public share slug"),
    },
    async (params) => {
      try {
        const result = await client.shares.getPublic(params.slug);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "share-slug-stats",
    "Get visit statistics for a specific share link (owner only). Requires scope: settings:read. Note: uses direct HTTP (SDK method pending).",
    {
      slug: z.string().describe("Share link slug"),
    },
    async (params) => {
      try {
        // SDK bypass: SharesResource lacks getSlugStats() method
        const httpClient = (client.shares as any).httpClient;
        const result = await httpClient.request(
          `/shares/${encodeURIComponent(params.slug)}/stats`,
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
