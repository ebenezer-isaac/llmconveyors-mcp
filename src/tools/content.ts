import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerContentTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "content-save",
    "Save a source document for use as context in AI generation. Returns success status. Requires scope: sessions:write.",
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
    "Delete a generation and all its artifacts from a session. Requires scope: sessions:write.",
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
    "Research and create a sender profile for content generation. Returns sender context. Requires scope: sessions:write. At least one of companyWebsite or companyName must be provided.",
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
    "List all saved source documents used as context for AI generation. Requires scope: sessions:read.",
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
    "Get a specific source document by type. Requires scope: sessions:read.",
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
    "Delete a source document by type. Requires scope: sessions:write.",
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
