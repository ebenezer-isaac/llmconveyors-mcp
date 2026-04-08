import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerResumeTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "resume-parse",
    "Parse a resume file (PDF, DOCX, or TXT) into structured JSON Resume format. Accepts base64-encoded file content and returns structured data with contact info, work experience, education, and skills. Use this to extract structured data from an existing resume file. For uploading and parsing in one step, use upload-resume instead. Requires scope: resume:write.",
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
    "Validate a resume object against the JSON Resume schema, returning any errors and warnings (missing fields, invalid formats, incomplete sections). Use this after parsing or editing a resume to verify it is well-formed before rendering or submitting to agents. Does not modify the resume. Requires scope: resume:write.",
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
    "Render a JSON Resume object to a downloadable PDF or HTML file using a specified theme. Returns a URL to download the generated file. Use this to produce a polished, formatted resume for sharing or printing. Use resume-themes to see available themes. For a quick inline preview without generating a file, use resume-preview instead. Requires scope: resume:write.",
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
    "Preview a JSON Resume object as inline HTML using a specified theme. Returns the rendered HTML string directly (not a URL). Use this for quick visual previews without generating a downloadable file. For producing a downloadable PDF or HTML file, use resume-render instead. Requires scope: resume:write.",
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
    "List all available resume themes with their IDs, names, and descriptions. Use this to discover theme options before calling resume-render or resume-preview, or to let the user choose a theme. Read-only, no side effects. Requires scope: resume:read.",
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
    "Convert a resume from Reactive Resume (RxResume) format into JSON Resume format. Use this to import resumes exported from the Reactive Resume application. Returns the converted resume object. Does not store the result; save it with master-resume-upsert if needed. Requires scope: resume:write. For the reverse conversion, use resume-export-rx.",
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
    "Convert a JSON Resume object to Reactive Resume (RxResume) format for use in the Reactive Resume application. Optionally include design/styling configuration. Read-only conversion, does not modify the source resume. Requires scope: resume:read. For the reverse conversion, use resume-import-rx.",
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
    "Get the user's stored master resume, returning its label, raw text, and structured data. The master resume serves as the default resume for agent runs when no other resume is provided. Use this to review the current master resume before running job-hunter-run. Read-only, no side effects. Requires scope: resume:read. Use master-resume-upsert to create or update it.",
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
    "Create or replace the user's master resume (upsert). The master resume is used as the default resume for job-hunter-run when no other resume is provided. Overwrites any existing master resume. Requires scope: resume:write. Use master-resume-get to check if one already exists. Use resume-parse to extract structured data from a file before saving.",
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
    "Permanently delete the user's master resume. After deletion, agent runs will require a resume to be provided directly. This is irreversible. Requires scope: resume:write. Use master-resume-get to review the resume before deleting.",
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
