import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerUploadTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "upload-resume",
    "Upload and parse a resume file. Accepts base64-encoded file content. Returns parsed resume data. Requires scope: upload:write.",
    {
      fileBase64: z.string().max(13_981_014).describe("Base64-encoded file content (PDF, DOCX, etc.) — max ~10 MB"),
      filename: z.string().describe("Original filename with extension (e.g. resume.pdf)"),
      contentType: z.string().optional().describe("MIME type (e.g. application/pdf)"),
    },
    async (params) => {
      try {
        const buffer = Buffer.from(params.fileBase64, "base64");
        const result = await client.upload.resume(buffer, {
          filename: params.filename,
          contentType: params.contentType,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "upload-job-file",
    "Upload and parse a job description file. Accepts base64-encoded file content. Returns parsed job data. Requires scope: upload:write.",
    {
      fileBase64: z.string().describe("Base64-encoded file content (PDF, DOCX, etc.)"),
      filename: z.string().describe("Original filename with extension"),
      contentType: z.string().optional().describe("MIME type"),
    },
    async (params) => {
      try {
        const buffer = Buffer.from(params.fileBase64, "base64");
        const result = await client.upload.jobFile(buffer, {
          filename: params.filename,
          contentType: params.contentType,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "upload-job-text",
    "Upload a job description as plain text or fetch from a URL. At least one of text or url is required. Returns parsed job data. Requires scope: upload:write.",
    {
      text: z.string().max(50_000).optional().describe("Job description text (max 50K characters). Required if url is not provided."),
      url: z.string().optional().describe("URL to fetch job description from. Required if text is not provided."),
      source: z.string().optional().describe("Source label/identifier for the job posting"),
    },
    async (params) => {
      try {
        if (!params.text && !params.url) {
          return {
            content: [{ type: "text", text: "Error: At least one of 'text' or 'url' must be provided" }],
            isError: true,
          };
        }
        const result = await client.upload.jobText({
          ...(params.text != null && { text: params.text }),
          ...(params.url != null && { url: params.url }),
          ...(params.source != null && { source: params.source }),
        } as any); // TODO: remove as any when SDK adds `url` field to JobTextRequest
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
