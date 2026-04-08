import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerSharesTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "share-create",
    "Create a shareable public link for a generation's artifacts (resume, cover letter, emails). Returns a slug and public URL that anyone can view without authentication. Creates a new share record. Requires scope: sessions:read. Use after running job-hunter-run or b2b-sales-run to share the output. Use share-slug-stats to track views.",
    {
      sessionId: z.string().describe("Session ID containing the generation"),
      generationId: z.string().describe("Generation ID to share"),
    },
    async (params) => {
      try {
        const result = await client.shares.create({
          sessionId: params.sessionId,
          generationId: params.generationId,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "share-stats",
    "Get aggregate statistics about all shared links for the current user, including total shares and total views. Use this for an overview of sharing activity. Read-only, no side effects. Requires scope: sessions:read. For per-link stats, use share-slug-stats with a specific slug.",
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
    "Retrieve a publicly shared resource by its slug. Returns the shared artifacts (resume, cover letter, emails) without requiring authentication. Use this to view what a share link contains. Read-only, no side effects. No auth required (public endpoint).",
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
    "Get visit statistics for a specific share link, including view count and visit timestamps. Only accessible by the share owner. Use this to track engagement on a specific shared artifact. Read-only, no side effects. Requires scope: sessions:read. For aggregate stats across all shares, use share-stats instead.",
    {
      slug: z.string().describe("Share link slug"),
    },
    async (params) => {
      try {
        const result = await client.shares.getShareStats(params.slug);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
