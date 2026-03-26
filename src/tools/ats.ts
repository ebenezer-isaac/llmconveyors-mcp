import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors, type ATSScoreRequest } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerAtsTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "ats-score",
    "Score a resume against a job description for ATS compatibility. Returns overall score, grade, keyword matches, and improvement suggestions. Consumes credits. Requires scope: ats:write.",
    {
      // TODO(SDK): SDK type uses `resume: Record<string, unknown>` and `jobDescription: Record<string, unknown>`
      // but the actual API expects string fields. Remove cast once SDK types are fixed.
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
        } as unknown as ATSScoreRequest); // SDK type stale: expects Record but API accepts string
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
