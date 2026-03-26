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
    "master-resume-create",
    "Create a new master resume. Returns the saved master resume with its ID. Requires scope: resume:write.",
    {
      name: z.string().describe("Name/label for this master resume"),
      resume: z.record(z.unknown()).describe("Resume data object (structured JSON Resume or raw text in a wrapper)"),
      metadata: z.record(z.unknown()).optional().describe("Optional metadata for the master resume"),
    },
    async (params) => {
      try {
        const result = await client.resume.createMaster({
          name: params.name,
          resume: params.resume,
          ...(params.metadata != null && { metadata: params.metadata }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "master-resume-list",
    "List all master resumes. Returns an array of master resume objects. Requires scope: resume:read.",
    {},
    async () => {
      try {
        const result = await client.resume.listMasters();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "master-resume-get",
    "Get a master resume by ID. Returns the full master resume object. Requires scope: resume:read.",
    {
      id: z.string().describe("Master resume ID"),
    },
    async (params) => {
      try {
        const result = await client.resume.getMaster(params.id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "master-resume-update",
    "Update a master resume by ID. Returns the updated master resume. Requires scope: resume:write.",
    {
      id: z.string().describe("Master resume ID"),
      name: z.string().optional().describe("Updated name/label"),
      resume: z.record(z.unknown()).optional().describe("Updated resume data object"),
      metadata: z.record(z.unknown()).optional().describe("Updated metadata"),
    },
    async (params) => {
      try {
        const result = await client.resume.updateMaster(params.id, {
          ...(params.name != null && { name: params.name }),
          ...(params.resume != null && { resume: params.resume }),
          ...(params.metadata != null && { metadata: params.metadata }),
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "master-resume-delete",
    "Delete a master resume by ID. Requires scope: resume:write.",
    {
      id: z.string().describe("Master resume ID"),
    },
    async (params) => {
      try {
        await client.resume.deleteMaster(params.id);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: "Master resume deleted", id: params.id }) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
