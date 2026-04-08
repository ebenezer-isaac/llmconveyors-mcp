import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerAgentTools(server: McpServer, client: LLMConveyors): void {
  // --- Job Hunter: full run ---
  server.tool(
    "job-hunter-run",
    "Run the Job Hunter agent — generates a tailored CV, cover letter, and cold email for a job application. Supports phased execution: set autoSelectContacts=false to pause for contact selection (poll with agent-status, respond with agent-interact). Consumes 30-500 credits. Rate limited: 10 req/min. Requires scope: jobs:write. Check balance with settings-usage-summary before running.",
    {
      companyName: z.string().describe("Target company name"),
      jobTitle: z.string().describe("Job title to apply for"),
      jobDescription: z.string().describe("Full job description text"),
      companyWebsite: z.string().describe("Target company website URL for research phase"),
      sessionId: z.string().optional().describe("Existing session ID to continue a previous run"),
      generationId: z.string().optional().describe("Existing generation ID to continue"),
      masterResumeId: z.string().optional().describe("ID of a stored master resume to use"),
      tier: z.enum(["free", "byo"]).optional().describe("Billing tier: free (platform credits) or byo (bring your own key)"),
      model: z.enum(["flash", "pro"]).optional().describe("AI model: flash (faster/cheaper) or pro (higher quality)"),
      webhookUrl: z.string().optional().describe("Webhook URL for async status updates (generation.completed, generation.failed, generation.awaiting_input)"),
      mode: z.enum(["standard", "cold_outreach"]).optional().describe("Generation mode"),
      theme: z.enum(["even", "stackoverflow", "class", "professional", "elegant", "macchiato", "react", "academic"]).optional().describe("Resume theme"),
      autoSelectContacts: z.boolean().optional().describe("Set false for phased execution with contact selection gate. Default true for API keys."),
      skipResearchCache: z.boolean().optional().describe("Force fresh company research instead of using cache"),
      contactName: z.string().optional().describe("Hiring manager or recruiter name"),
      contactTitle: z.string().optional().describe("Contact job title"),
      contactEmail: z.string().optional().describe("Contact email for cold outreach"),
      genericEmail: z.string().optional().describe("Generic company email (e.g. careers@company.com) as fallback"),
      emailAddresses: z.string().optional().describe("Comma-separated email addresses for outreach"),
      originalCV: z.string().optional().describe("Original CV text to use directly instead of master resume"),
      extensiveCV: z.string().optional().describe("Extended/detailed CV text for richer generation"),
      cvStrategy: z.string().optional().describe("Strategy instructions for CV generation"),
      coverLetterStrategy: z.string().optional().describe("Strategy instructions for cover letter generation"),
      coldEmailStrategy: z.string().optional().describe("Strategy instructions for cold email generation"),
      reconStrategy: z.string().optional().describe("Strategy instructions for company research/recon phase"),
      specificCore: z.string().optional().describe("Specific core competencies or skills to emphasize"),
      companyProfile: z.string().optional().describe("Pre-researched company profile to skip research phase"),
      jobSourceUrl: z.string().optional().describe("URL of the original job posting"),
    },
    async (params) => {
      try {
        const result = await client.agents.run("job-hunter", {
          companyName: params.companyName,
          jobTitle: params.jobTitle,
          jobDescription: params.jobDescription,
          companyWebsite: params.companyWebsite,
          ...(params.sessionId != null && { sessionId: params.sessionId }),
          ...(params.generationId != null && { generationId: params.generationId }),
          ...(params.masterResumeId != null && { masterResumeId: params.masterResumeId }),
          ...(params.tier != null && { tier: params.tier }),
          ...(params.model != null && { model: params.model }),
          ...(params.webhookUrl != null && { webhookUrl: params.webhookUrl }),
          ...(params.mode != null && { mode: params.mode }),
          ...(params.theme != null && { theme: params.theme }),
          ...(params.autoSelectContacts != null && { autoSelectContacts: params.autoSelectContacts }),
          ...(params.skipResearchCache != null && { skipResearchCache: params.skipResearchCache }),
          ...(params.contactName != null && { contactName: params.contactName }),
          ...(params.contactTitle != null && { contactTitle: params.contactTitle }),
          ...(params.contactEmail != null && { contactEmail: params.contactEmail }),
          ...(params.genericEmail != null && { genericEmail: params.genericEmail }),
          ...(params.emailAddresses != null && { emailAddresses: params.emailAddresses }),
          ...(params.originalCV != null && { originalCV: params.originalCV }),
          ...(params.extensiveCV != null && { extensiveCV: params.extensiveCV }),
          ...(params.cvStrategy != null && { cvStrategy: params.cvStrategy }),
          ...(params.coverLetterStrategy != null && { coverLetterStrategy: params.coverLetterStrategy }),
          ...(params.coldEmailStrategy != null && { coldEmailStrategy: params.coldEmailStrategy }),
          ...(params.reconStrategy != null && { reconStrategy: params.reconStrategy }),
          ...(params.specificCore != null && { specificCore: params.specificCore }),
          ...(params.companyProfile != null && { companyProfile: params.companyProfile }),
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
    "Run the B2B Sales agent — researches a company and generates personalized sales outreach (emails, follow-ups). Supports phased execution: set autoSelectContacts=false to pause for contact selection, autoApproveDraft=false to review before sending. Poll with agent-status, respond with agent-interact. Consumes 50-500 credits. Rate limited: 10 req/min. Requires scope: sales:write. Check balance with settings-usage-summary before running.",
    {
      companyName: z.string().describe("Target company name"),
      companyWebsite: z.string().describe("Target company website URL"),
      sessionId: z.string().optional().describe("Existing session ID to continue a previous run"),
      generationId: z.string().optional().describe("Existing generation ID to continue"),
      model: z.enum(["flash", "pro"]).optional().describe("AI model: flash (faster/cheaper) or pro (higher quality)"),
      userCompanyContext: z.string().optional().describe("Context about your own company for personalization"),
      targetCompanyContext: z.string().optional().describe("Pre-researched context about the target company"),
      contactName: z.string().optional().describe("Target contact name"),
      contactTitle: z.string().optional().describe("Target contact job title"),
      contactEmail: z.string().optional().describe("Target contact email address"),
      senderName: z.string().optional().describe("Name of the person sending the outreach"),
      salesStrategy: z.string().optional().describe("Sales strategy to use for outreach generation"),
      reconStrategy: z.string().optional().describe("Strategy instructions for company research/recon phase"),
      companyResearch: z.string().optional().describe("Pre-researched company information to skip research phase"),
      researchMode: z.enum(["parallel", "sequential"]).optional().describe("Research execution mode: parallel (faster) or sequential"),
      autoSelectContacts: z.boolean().optional().describe("Set false for phased execution with contact selection gate"),
      autoApproveDraft: z.boolean().optional().describe("Set false to pause for draft review before finalizing"),
      autoApproveFollowups: z.boolean().optional().describe("Set false to pause for follow-up review before finalizing"),
      followUpCount: z.number().optional().describe("Number of follow-up emails to generate"),
      followUpDelayDays: z.number().optional().describe("Days between follow-up emails"),
      skipResearchCache: z.boolean().optional().describe("Force fresh company research instead of using cache"),
    },
    async (params) => {
      try {
        const result = await client.agents.run("b2b-sales", {
          companyName: params.companyName,
          companyWebsite: params.companyWebsite,
          ...(params.sessionId != null && { sessionId: params.sessionId }),
          ...(params.generationId != null && { generationId: params.generationId }),
          ...(params.model != null && { model: params.model }),
          ...(params.userCompanyContext != null && { userCompanyContext: params.userCompanyContext }),
          ...(params.targetCompanyContext != null && { targetCompanyContext: params.targetCompanyContext }),
          ...(params.contactName != null && { contactName: params.contactName }),
          ...(params.contactTitle != null && { contactTitle: params.contactTitle }),
          ...(params.contactEmail != null && { contactEmail: params.contactEmail }),
          ...(params.senderName != null && { senderName: params.senderName }),
          ...(params.salesStrategy != null && { salesStrategy: params.salesStrategy }),
          ...(params.reconStrategy != null && { reconStrategy: params.reconStrategy }),
          ...(params.companyResearch != null && { companyResearch: params.companyResearch }),
          ...(params.researchMode != null && { researchMode: params.researchMode }),
          ...(params.autoSelectContacts != null && { autoSelectContacts: params.autoSelectContacts }),
          ...(params.autoApproveDraft != null && { autoApproveDraft: params.autoApproveDraft }),
          ...(params.autoApproveFollowups != null && { autoApproveFollowups: params.autoApproveFollowups }),
          ...(params.followUpCount != null && { followUpCount: params.followUpCount }),
          ...(params.followUpDelayDays != null && { followUpDelayDays: params.followUpDelayDays }),
          ...(params.skipResearchCache != null && { skipResearchCache: params.skipResearchCache }),
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
    "Poll the status of a running agent job to check progress, completion, or if it is awaiting input. Returns status, logs, and artifacts when available. Use this after calling job-hunter-run or b2b-sales-run to monitor the asynchronous job. When status is awaiting_input, use agent-interact to respond. Read-only, no side effects. Requires scope: jobs:read or sales:read.",
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
    "Submit a response to a phased agent workflow that is awaiting input (e.g. contact selection, draft approval). Used when agent-status returns status=awaiting_input. The interactionType and interactionData fields come from the awaiting_input response. Rate limited: 10 req/min. Requires scope: jobs:write or sales:write.",
    {
      agentType: z.enum(["job-hunter", "b2b-sales"]).describe("Agent type"),
      generationId: z.string().describe("Generation ID from the run or status response"),
      sessionId: z.string().describe("Session ID from the run or status response"),
      interactionType: z.string().describe("Interaction type from the awaiting_input response"),
      interactionData: z.record(z.unknown()).describe("Response data for the interaction"),
    },
    async (params) => {
      try {
        const result = await client.agents.interact(params.agentType, {
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
    "Generate a CV synchronously without running the full Job Hunter pipeline. Faster but produces only a CV, no cover letter or cold email. Pass a prompt describing the desired CV content, style, or modifications. Consumes credits. Rate limited: 10 req/min. Requires scope: jobs:write.",
    {
      prompt: z.string().describe("Prompt for CV generation — describe the desired CV content, style, or modifications"),
    },
    async (params) => {
      try {
        const result = await client.agents.generateCv({
          prompt: params.prompt,
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
    "Get the manifest for an agent type, describing its input fields, capabilities, supported options, and billing information (credit costs per action). Use this to discover what parameters an agent accepts before running it, or to display pricing information. Read-only, no side effects. Requires scope: jobs:read or sales:read.",
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
