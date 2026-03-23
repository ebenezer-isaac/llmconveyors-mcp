import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";

export function registerContentTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "content-save",
    "Save generated content (CV, cover letter, cold email, etc.) to the platform.",
    {
      body: z.record(z.unknown()).describe("Content data to save"),
    },
    async (params) => {
      try {
        const result = await client.content.save(params.body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "content-delete-generation",
    "Delete a generation and all its associated content by generation ID.",
    {
      id: z.string().describe("Generation ID to delete"),
    },
    async (params) => {
      try {
        const result = await client.content.deleteGeneration(params.id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
