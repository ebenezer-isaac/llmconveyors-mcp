import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerAtsTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "ats-score",
    "Score a resume against a job description for ATS compatibility. Returns overall score, grade, keyword matches, and improvement suggestions. Consumes credits. Requires scope: ats:write.",
    {
      resumeText: z.string().describe("Resume as plain text"),
      jobDescription: z.string().describe("Job description as plain text"),
      jobTitle: z.string().optional().describe("Job title for additional context"),
    },
    async (params) => {
      try {
        const result = await client.ats.score({
          resumeText: params.resumeText,
          jobDescription: params.jobDescription,
          ...(params.jobTitle != null && { jobTitle: params.jobTitle }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
