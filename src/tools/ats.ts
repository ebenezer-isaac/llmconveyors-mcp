import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";

export function registerAtsTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "ats-score",
    "Score a resume against a job description for ATS compatibility. Returns score breakdown and improvement suggestions.",
    {
      resume: z.record(z.unknown()).describe("Resume in JSON Resume format"),
      jobDescription: z.record(z.unknown()).describe("Parsed job description object"),
    },
    async (params) => {
      try {
        const result = await client.ats.score({
          resume: params.resume,
          jobDescription: params.jobDescription,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
