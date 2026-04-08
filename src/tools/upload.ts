import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerUploadTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "upload-resume",
    "Upload a resume file (PDF, DOCX, TXT) as base64-encoded content and parse it into structured data. Returns extracted contact info, work experience, education, and skills. Use this as the first step in a job application workflow before running ats-score or job-hunter-run. Max file size ~10 MB. Requires scope: upload:write. For parsing without the upload step, use resume-parse instead.",
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
    "Upload a job description file (PDF, DOCX, TXT) as base64-encoded content and parse it into structured job data. Returns extracted job title, requirements, qualifications, and company info. Use this when the job description is in a file rather than plain text. Max file size ~10 MB. Requires scope: upload:write. For plain text or URL-based job descriptions, use upload-job-text instead.",
    {
      fileBase64: z.string().max(13_981_014).describe("Base64-encoded file content (PDF, DOCX, etc.) — max ~10 MB"),
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
    "Parse a job description from plain text or fetch and parse from a URL. Returns structured job data including title, requirements, and qualifications. Use this when you have the job description as text or a URL to a job posting page. At least one of text or url is required. Requires scope: upload:write. For file-based job descriptions (PDF, DOCX), use upload-job-file instead.",
    {
      text: z.string().max(50_000).optional().describe("Job description text (max 50K characters). Required if url is not provided."),
      url: z.string().url().max(2048).optional().describe("URL to fetch job description from. Required if text is not provided."),
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
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
