import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerContentTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "content-save",
    "Save a source document that will be used as context in future AI generation runs (job-hunter-run, b2b-sales-run). Overwrites any existing document of the same type. Use this to store your CV, cover letter templates, or strategy documents before running agents. Requires scope: sessions:write. Use content-list-sources to see what is already saved. Use content-get-source to read a specific saved document.",
    {
      docType: z.enum([
        "original_cv", "extensive_cv", "cover_letter",
        "cv_strategy", "cover_letter_strategy", "cold_email_strategy",
        "recon_strategy", "company_context",
      ]).describe("Type of source document"),
      content: z.string().max(512_000).describe("Document content text (max 512K characters)"),
    },
    async (params) => {
      try {
        const result = await client.content.save({
          docType: params.docType,
          content: params.content,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "content-delete-generation",
    "Permanently delete a generation and all its artifacts (CV, cover letter, emails) from a session. This is irreversible and removes all files associated with that generation. Use this to clean up unwanted outputs. Requires scope: sessions:write. Use session-hydrate first to review the generation before deleting.",
    {
      id: z.string().describe("Generation ID to delete"),
      sessionId: z.string().describe("Session ID that owns the generation"),
    },
    async (params) => {
      try {
        const result = await client.content.deleteGeneration(params.id, params.sessionId);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "content-research-sender",
    "Research a company and create a sender profile for personalized content generation. Returns structured sender context (company info, positioning, value propositions). Use this before b2b-sales-run to pre-populate sender context for better outreach personalization. Consumes credits. At least one of companyWebsite or companyName must be provided. Requires scope: sessions:write.",
    {
      companyWebsite: z.string().optional().describe("Company website to research"),
      companyName: z.string().optional().describe("Company name for context"),
    },
    async (params) => {
      try {
        if (!params.companyWebsite && !params.companyName) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "At least one of companyWebsite or companyName is required" }, null, 2) }],
            isError: true,
          };
        }
        const body: { companyWebsite?: string; companyName?: string } = {};
        if (params.companyWebsite != null) body.companyWebsite = params.companyWebsite;
        if (params.companyName != null) body.companyName = params.companyName;
        const result = await client.content.researchSender(body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "content-list-sources",
    "List all saved source documents used as context for AI generation, showing document types and metadata. Use this to check what context documents are available before running agents. Read-only, no side effects. Requires scope: sessions:read. Use content-get-source to read a specific document. Use content-save to add or update documents.",
    {},
    async () => {
      try {
        const result = await client.content.listSources();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "content-get-source",
    "Retrieve the full content of a specific saved source document by type (e.g. original_cv, cv_strategy, cold_email_strategy). Use this to review or display a previously saved context document. Read-only, no side effects. Requires scope: sessions:read. Use content-list-sources to see all available document types.",
    {
      docType: z.enum([
        "original_cv", "extensive_cv", "cover_letter",
        "cv_strategy", "cover_letter_strategy", "cold_email_strategy",
        "recon_strategy", "company_context",
      ]).describe("Type of source document"),
    },
    async (params) => {
      try {
        const result = await client.content.getSource(params.docType);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "content-delete-source",
    "Permanently delete a saved source document by type. Future agent runs will no longer use this document as context. Use this to remove outdated context documents before saving new ones. Requires scope: sessions:write. Use content-list-sources to verify which documents exist before deleting.",
    {
      docType: z.enum([
        "original_cv", "extensive_cv", "cover_letter",
        "cv_strategy", "cover_letter_strategy", "cold_email_strategy",
        "recon_strategy", "company_context",
      ]).describe("Type of source document to delete"),
    },
    async (params) => {
      try {
        const result = await client.content.deleteSource(params.docType);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
