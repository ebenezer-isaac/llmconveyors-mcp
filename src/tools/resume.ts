import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerResumeTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "resume-parse",
    "Parse a resume file into structured JSON Resume format. Accepts base64-encoded file content. Requires scope: resume:write.",
    {
      fileBase64: z.string().describe("Base64-encoded resume file (PDF, DOCX, TXT)"),
      filename: z.string().describe("Original filename with extension"),
      contentType: z.string().optional().describe("MIME type (e.g. application/pdf)"),
      mode: z.enum(["fast", "thorough"]).optional().describe("Parsing mode: fast for speed, thorough for accuracy"),
    },
    async (params) => {
      try {
        const buffer = Buffer.from(params.fileBase64, "base64");
        const result = await client.resume.parse(buffer, {
          filename: params.filename,
          contentType: params.contentType,
          mode: params.mode,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "resume-validate",
    "Validate a resume in JSON Resume format. Returns validation errors and warnings. Requires scope: resume:write.",
    {
      resume: z.record(z.unknown()).describe("Resume object in JSON Resume format"),
    },
    async (params) => {
      try {
        const result = await client.resume.validate({ resume: params.resume });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "resume-render",
    "Render a resume to PDF or HTML. Returns a URL to download the generated file. Requires scope: resume:write.",
    {
      resume: z.record(z.unknown()).describe("Resume object in JSON Resume format"),
      theme: z.string().describe("Theme name (e.g. even, stackoverflow, class, professional, elegant, macchiato, react, academic)"),
      format: z.enum(["pdf", "html"]).optional().describe("Output format: pdf (default) or html"),
    },
    async (params) => {
      try {
        const result = await client.resume.render({
          resume: params.resume,
          theme: params.theme,
          ...(params.format != null && { format: params.format }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "resume-preview",
    "Preview a resume as HTML. Returns rendered HTML string. Requires scope: resume:write.",
    {
      resume: z.record(z.unknown()).describe("Resume object in JSON Resume format"),
      theme: z.string().describe("Theme name (e.g. even, stackoverflow, class, professional)"),
    },
    async (params) => {
      try {
        const result = await client.resume.preview({
          resume: params.resume,
          theme: params.theme,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "resume-themes",
    "List all available resume themes. Returns theme IDs, names, and descriptions. Requires scope: resume:read.",
    {},
    async () => {
      try {
        const result = await client.resume.themes();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "resume-import-rx",
    "Import a resume from Reactive Resume (RxResume) format into JSON Resume format. Requires scope: resume:write.",
    {
      data: z.record(z.unknown()).describe("RxResume data object to import"),
    },
    async (params) => {
      try {
        const result = await client.resume.importRxResume({ data: params.data });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "resume-export-rx",
    "Export a JSON Resume to Reactive Resume (RxResume) format. Requires scope: resume:read.",
    {
      resume: z.record(z.unknown()).describe("Resume object in JSON Resume format"),
      designBlob: z.record(z.unknown()).optional().describe("Optional design/styling configuration"),
    },
    async (params) => {
      try {
        const result = await client.resume.exportRxResume({
          resume: params.resume,
          ...(params.designBlob != null && { designBlob: params.designBlob }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "master-resume-get",
    "Get the user's master resume. Returns the master resume with label, rawText, and structuredData. Requires scope: resume:read.",
    {},
    async () => {
      try {
        const result = await client.resume.getMaster();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "master-resume-upsert",
    "Create or replace the user's master resume (upsert). Requires scope: resume:write.",
    {
      label: z.string().describe("Label for the master resume"),
      rawText: z.string().describe("Raw text content of the resume"),
      structuredData: z.record(z.unknown()).optional().describe("Optional structured resume data"),
    },
    async (params) => {
      try {
        const result = await client.resume.upsertMaster({
          label: params.label,
          rawText: params.rawText,
          ...(params.structuredData != null && { structuredData: params.structuredData }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "master-resume-delete",
    "Delete the user's master resume. Requires scope: resume:write.",
    {},
    async () => {
      try {
        const result = await client.resume.deleteMaster();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
