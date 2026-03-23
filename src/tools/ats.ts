import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";

export function registerAtsTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "ats-score",
    "Score a resume against a job description for ATS compatibility. Returns overall score, grade, keyword matches, and improvement suggestions.",
    {
      resumeText: z.string().describe("Resume as plain text"),
      jobDescription: z.string().describe("Job description as plain text"),
    },
    async (params) => {
      try {
        const result = await client.ats.score({
          resumeText: params.resumeText,
          jobDescription: params.jobDescription,
        } as any);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
