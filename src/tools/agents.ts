import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerAgentTools(server: McpServer, client: LLMConveyors): void {
  // --- Job Hunter: full run ---
  server.tool(
    "job-hunter-run",
    "Run the Job Hunter agent — generates a tailored CV, cover letter, and cold email for a job application. Returns artifacts when complete. Consumes 30-500 credits. Rate limited: 10 req/min. Requires scope: jobs:write. Check balance with settings-usage-summary before running.",
    {
      companyName: z.string().describe("Target company name"),
      jobTitle: z.string().describe("Job title to apply for"),
      jobDescription: z.string().optional().describe("Full job description text"),
      companyWebsite: z.string().optional().describe("Target company website URL for research phase"),
      masterResumeId: z.string().optional().describe("ID of a stored master resume to use"),
      theme: z.enum(["even", "stackoverflow", "class", "professional", "elegant", "macchiato", "react", "academic"]).optional().describe("Resume theme"),
      contactName: z.string().optional().describe("Hiring manager or recruiter name"),
      contactTitle: z.string().optional().describe("Contact job title"),
      contactEmail: z.string().optional().describe("Contact email for cold outreach"),
      mode: z.enum(["standard", "cold_outreach"]).optional().describe("Generation mode"),
      model: z.enum(["flash", "pro"]).optional().describe("AI model: flash (faster/cheaper) or pro (higher quality)"),
      autoSelectContacts: z.boolean().optional().describe("Set false for phased execution with contact selection gate. Default true for API keys."),
      originalCV: z.string().optional().describe("Original CV text to use directly instead of master resume"),
      extensiveCV: z.string().optional().describe("Extended/detailed CV text for richer generation"),
      skipResearchCache: z.boolean().optional().describe("Force fresh company research instead of using cache"),
      jobSourceUrl: z.string().optional().describe("URL of the original job posting"),
    },
    async (params) => {
      try {
        const result = await client.agents.run("job-hunter", {
          companyName: params.companyName,
          jobTitle: params.jobTitle,
          ...(params.jobDescription != null && { jobDescription: params.jobDescription }),
          ...(params.companyWebsite != null && { companyWebsite: params.companyWebsite }),
          ...(params.masterResumeId != null && { masterResumeId: params.masterResumeId }),
          ...(params.theme != null && { theme: params.theme }),
          ...(params.contactName != null && { contactName: params.contactName }),
          ...(params.contactTitle != null && { contactTitle: params.contactTitle }),
          ...(params.contactEmail != null && { contactEmail: params.contactEmail }),
          ...(params.mode != null && { mode: params.mode }),
          ...(params.model != null && { model: params.model }),
          ...(params.autoSelectContacts != null && { autoSelectContacts: params.autoSelectContacts }),
          ...(params.originalCV != null && { originalCV: params.originalCV }),
          ...(params.extensiveCV != null && { extensiveCV: params.extensiveCV }),
          ...(params.skipResearchCache != null && { skipResearchCache: params.skipResearchCache }),
          ...(params.jobSourceUrl != null && { jobSourceUrl: params.jobSourceUrl }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  // --- B2B Sales: full run ---
  server.tool(
    "b2b-sales-run",
    "Run the B2B Sales agent — researches a company and generates personalized sales outreach. Consumes 50-500 credits. Rate limited: 10 req/min. Requires scope: sales:write. Check balance with settings-usage-summary before running.",
    {
      companyName: z.string().describe("Target company name"),
      companyWebsite: z.string().describe("Target company website URL"),
      targetProfile: z.record(z.unknown()).optional().describe("Target contact profile object (name, title, email, etc.)"),
      sessionId: z.string().optional().describe("Existing session ID to continue"),
      strategy: z.string().optional().describe("Sales strategy to use"),
      webhookUrl: z.string().optional().describe("Webhook URL for async status updates"),
      model: z.enum(["flash", "pro"]).optional().describe("AI model: flash (faster/cheaper) or pro (higher quality)"),
      userCompanyContext: z.string().optional().describe("Context about your own company for personalization"),
      autoSelectContacts: z.boolean().optional().describe("Set false for phased execution with contact selection gate"),
    },
    async (params) => {
      try {
        const result = await client.agents.run("b2b-sales", {
          companyName: params.companyName,
          companyWebsite: params.companyWebsite,
          ...(params.targetProfile != null && { targetProfile: params.targetProfile }),
          ...(params.sessionId != null && { sessionId: params.sessionId }),
          ...(params.strategy != null && { strategy: params.strategy }),
          ...(params.webhookUrl != null && { webhookUrl: params.webhookUrl }),
          ...(params.model != null && { model: params.model }),
          ...(params.userCompanyContext != null && { userCompanyContext: params.userCompanyContext }),
          ...(params.autoSelectContacts != null && { autoSelectContacts: params.autoSelectContacts }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  // --- Agent status polling ---
  server.tool(
    "agent-status",
    "Check the status of a running agent job. Requires scope: jobs:read or sales:read.",
    {
      agentType: z.enum(["job-hunter", "b2b-sales"]).describe("Agent type"),
      jobId: z.string().describe("Job ID returned from a generate call"),
      include: z.array(z.enum(["logs", "artifacts"])).optional().describe("Data to include. Defaults to both logs and artifacts. Omit for lightweight status checks."),
    },
    async (params) => {
      try {
        const result = await client.agents.getStatus(params.agentType, params.jobId, {
          include: params.include ?? ["logs", "artifacts"],
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  // --- Agent interact (phased workflows) ---
  server.tool(
    "agent-interact",
    "Submit a response to a phased agent workflow that is awaiting input. Used when agent-status returns awaiting_input. Rate limited: 10 req/min. Requires scope: jobs:write or sales:write.",
    {
      agentType: z.enum(["job-hunter", "b2b-sales"]).describe("Agent type"),
      generationId: z.string().describe("Generation ID from the run or status response"),
      sessionId: z.string().describe("Session ID from the run or status response"),
      interactionType: z.string().describe("Interaction type from the awaiting_input response"),
      interactionData: z.record(z.unknown()).describe("Response data for the interaction"),
    },
    async (params) => {
      try {
        // TODO: remove as any when SDK adds b2b-sales to PhasedAgentType
        const result = await client.agents.interact(params.agentType as any, {
          generationId: params.generationId,
          sessionId: params.sessionId,
          interactionType: params.interactionType,
          interactionData: params.interactionData,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  // --- Generate CV (synchronous, no streaming) ---
  server.tool(
    "job-hunter-generate-cv",
    "Generate a CV synchronously without running the full Job Hunter pipeline. Faster but produces only a CV, no cover letter or cold email. Consumes credits. Rate limited: 10 req/min. Requires scope: jobs:write.",
    {
      prompt: z.string().describe("Prompt for CV generation — describe the desired CV content, style, or modifications"),
      resume: z.record(z.unknown()).optional().describe("Resume data object in JSON Resume format"),
      jobDescription: z.string().optional().describe("Job description text for tailoring"),
      theme: z.enum(["even", "stackoverflow", "class", "professional", "elegant", "macchiato", "react", "academic"]).optional().describe("Resume theme"),
    },
    async (params) => {
      try {
        const result = await client.agents.generateCv({
          prompt: params.prompt,
          ...(params.resume != null && { resume: params.resume }),
          ...(params.jobDescription != null && { jobDescription: params.jobDescription }),
          ...(params.theme != null && { theme: params.theme }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  // --- Agent manifest ---
  server.tool(
    "agent-manifest",
    "Get the manifest (input fields, capabilities, billing) for an agent type. Requires scope: jobs:read or sales:read.",
    {
      agentType: z.enum(["job-hunter", "b2b-sales"]).describe("Agent type"),
    },
    async (params) => {
      try {
        const result = await client.agents.getManifest(params.agentType);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
