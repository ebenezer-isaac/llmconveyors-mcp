import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";

export function registerUploadTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "upload-resume",
    "Upload and parse a resume file. Accepts base64-encoded file content. Returns parsed resume data.",
    {
      fileBase64: z.string().describe("Base64-encoded file content (PDF, DOCX, etc.)"),
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
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "upload-job-file",
    "Upload and parse a job description file. Accepts base64-encoded file content. Returns parsed job data.",
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
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "upload-job-text",
    "Upload a job description as plain text. Returns parsed job data.",
    {
      text: z.string().describe("Job description text"),
      source: z.string().optional().describe("Source URL or identifier for the job posting"),
    },
    async (params) => {
      try {
        const result = await client.upload.jobText({
          text: params.text,
          source: params.source,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
