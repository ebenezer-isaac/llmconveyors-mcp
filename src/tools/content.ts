import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerContentTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "content-save",
    "Save a source document for use as context in AI generation. Returns success status. Requires scope: settings:write.",
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
        } as unknown as Parameters<typeof client.content.save>[0]); // SDK type is Record<string, unknown>, but API accepts typed fields
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "content-delete-generation",
    "Delete a generation and all its artifacts from a session. Requires scope: sessions:write. Note: uses direct HTTP because SDK lacks sessionId param.",
    {
      id: z.string().describe("Generation ID to delete"),
      sessionId: z.string().describe("Session ID that owns the generation"),
    },
    async (params) => {
      try {
        // SDK bypass: ContentResource.deleteGeneration() lacks sessionId param
        const httpClient = (client.content as any).httpClient;
        const result = await httpClient.request(
          `/content/generations/${encodeURIComponent(params.id)}`,
          { method: "DELETE", query: { sessionId: params.sessionId } },
        );
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  // TODO: replace httpClient bypass when SDK adds client.content.researchSender()
  server.tool(
    "content-research-sender",
    "Research and create a sender profile for content generation. Returns sender context. Requires scope: jobs:write or sales:write.",
    {
      companyWebsite: z.string().optional().describe("Company website to research"),
      companyName: z.string().optional().describe("Company name for context"),
    },
    async (params) => {
      try {
        const httpClient = (client.content as any).httpClient;
        const result = await httpClient.request("/content/research-sender", {
          method: "POST",
          body: {
            ...(params.companyWebsite != null && { companyWebsite: params.companyWebsite }),
            ...(params.companyName != null && { companyName: params.companyName }),
          },
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  // TODO: replace httpClient bypass when SDK adds client.content.listSources()
  server.tool(
    "content-list-sources",
    "List all saved source documents used as context for AI generation. Requires scope: settings:read.",
    {},
    async () => {
      try {
        const httpClient = (client.content as any).httpClient;
        const result = await httpClient.request("/content/sources");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  // TODO: replace httpClient bypass when SDK adds client.content.getSource()
  server.tool(
    "content-get-source",
    "Get a specific source document by type. Requires scope: settings:read.",
    {
      docType: z.enum([
        "original_cv", "extensive_cv", "cover_letter",
        "cv_strategy", "cover_letter_strategy", "cold_email_strategy",
        "recon_strategy", "company_context",
      ]).describe("Type of source document"),
    },
    async (params) => {
      try {
        const httpClient = (client.content as any).httpClient;
        const result = await httpClient.request(`/content/sources/${encodeURIComponent(params.docType)}`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  // TODO: replace httpClient bypass when SDK adds client.content.deleteSource()
  server.tool(
    "content-delete-source",
    "Delete a source document by type. Requires scope: settings:write.",
    {
      docType: z.enum([
        "original_cv", "extensive_cv", "cover_letter",
        "cv_strategy", "cover_letter_strategy", "cold_email_strategy",
        "recon_strategy", "company_context",
      ]).describe("Type of source document to delete"),
    },
    async (params) => {
      try {
        const httpClient = (client.content as any).httpClient;
        const result = await httpClient.request(`/content/sources/${encodeURIComponent(params.docType)}`, {
          method: "DELETE",
        });
        return { content: [{ type: "text", text: JSON.stringify(result ?? { success: true, message: "Source deleted", docType: params.docType }, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
