import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";

export function registerAgentTools(server: McpServer, client: LLMConveyors): void {
  // --- Job Hunter: full run ---
  server.tool(
    "job-hunter-run",
    "Run the Job Hunter agent — generates a tailored CV, cover letter, and cold email for a job application. Returns artifacts when complete.",
    {
      companyName: z.string().describe("Target company name"),
      jobTitle: z.string().describe("Job title to apply for"),
      jobDescription: z.string().describe("Full job description text"),
      masterResumeId: z.string().optional().describe("ID of a stored master resume to use"),
      theme: z.string().optional().describe("Resume theme (Even, StackOverflow, Class, Professional)"),
      contactName: z.string().optional().describe("Hiring manager or recruiter name"),
      contactEmail: z.string().optional().describe("Contact email for cold outreach"),
      mode: z.enum(["standard", "cold_outreach"]).optional().describe("Generation mode"),
    },
    async (params) => {
      try {
        const result = await client.agents.run("job-hunter", {
          companyName: params.companyName,
          jobTitle: params.jobTitle,
          jobDescription: params.jobDescription,
          masterResumeId: params.masterResumeId,
          theme: params.theme,
          contactName: params.contactName,
          contactEmail: params.contactEmail,
          mode: params.mode,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  // --- B2B Sales: full run ---
  server.tool(
    "b2b-sales-run",
    "Run the B2B Sales agent — researches a company and generates personalized sales outreach.",
    {
      companyName: z.string().describe("Target company name"),
      companyWebsite: z.string().describe("Target company website URL"),
      strategy: z.string().optional().describe("Sales strategy or approach"),
    },
    async (params) => {
      try {
        const result = await client.agents.run("b2b-sales", {
          companyName: params.companyName,
          companyWebsite: params.companyWebsite,
          strategy: params.strategy,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  // --- Agent status polling ---
  server.tool(
    "agent-status",
    "Check the status of a running agent job.",
    {
      agentType: z.enum(["job-hunter", "b2b-sales"]).describe("Agent type"),
      jobId: z.string().describe("Job ID returned from a generate call"),
    },
    async (params) => {
      try {
        const result = await client.agents.getStatus(params.agentType, params.jobId, {
          include: ["logs", "artifacts"],
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  // --- Agent manifest ---
  server.tool(
    "agent-manifest",
    "Get the manifest (input fields, capabilities, billing) for an agent type.",
    {
      agentType: z.enum(["job-hunter", "b2b-sales"]).describe("Agent type"),
    },
    async (params) => {
      try {
        const result = await client.agents.getManifest(params.agentType);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
