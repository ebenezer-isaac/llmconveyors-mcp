import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";

export function registerResumeTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "resume-parse",
    "Parse a resume file into structured JSON Resume format. Accepts base64-encoded file content.",
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
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "resume-validate",
    "Validate a resume in JSON Resume format. Returns validation errors and warnings.",
    {
      resume: z.record(z.unknown()).describe("Resume object in JSON Resume format"),
    },
    async (params) => {
      try {
        const result = await client.resume.validate({ resume: params.resume });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "resume-render",
    "Render a resume to PDF. Returns a URL to download the generated PDF.",
    {
      resume: z.record(z.unknown()).describe("Resume object in JSON Resume format"),
      theme: z.string().optional().describe("Theme name (e.g. Even, StackOverflow, Class, Professional)"),
      format: z.string().optional().describe("Output format"),
    },
    async (params) => {
      try {
        const result = await client.resume.render({
          resume: params.resume,
          theme: params.theme,
          format: params.format,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "resume-preview",
    "Preview a resume as HTML. Returns rendered HTML string.",
    {
      resume: z.record(z.unknown()).describe("Resume object in JSON Resume format"),
      theme: z.string().optional().describe("Theme name"),
    },
    async (params) => {
      try {
        const result = await client.resume.preview({
          resume: params.resume,
          theme: params.theme,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "resume-themes",
    "List all available resume themes. Returns theme IDs, names, and descriptions.",
    {},
    async () => {
      try {
        const result = await client.resume.themes();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "resume-import-rx",
    "Import a resume from Reactive Resume (RxResume) format into JSON Resume format.",
    {
      data: z.record(z.unknown()).describe("RxResume data object to import"),
    },
    async (params) => {
      try {
        const result = await client.resume.importRxResume({ data: params.data });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "resume-export-rx",
    "Export a JSON Resume to Reactive Resume (RxResume) format.",
    {
      resume: z.record(z.unknown()).describe("Resume object in JSON Resume format"),
    },
    async (params) => {
      try {
        const result = await client.resume.exportRxResume({ resume: params.resume });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "master-resume-create",
    "Create a new master resume. Returns the saved master resume with its ID.",
    {
      label: z.string().describe("Label/name for this master resume"),
      rawText: z.string().describe("Raw resume text content"),
      isDefault: z.boolean().optional().describe("Set as default master resume"),
    },
    async (params) => {
      try {
        const result = await client.resume.createMaster({
          label: params.label,
          rawText: params.rawText,
          isDefault: params.isDefault,
        } as any);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "master-resume-list",
    "List all master resumes. Returns an array of master resume objects.",
    {},
    async () => {
      try {
        const result = await client.resume.listMasters();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "master-resume-get",
    "Get a master resume by ID. Returns the full master resume object.",
    {
      id: z.string().describe("Master resume ID"),
    },
    async (params) => {
      try {
        const result = await client.resume.getMaster(params.id);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "master-resume-update",
    "Update a master resume by ID. Returns the updated master resume.",
    {
      id: z.string().describe("Master resume ID"),
      label: z.string().optional().describe("Updated label/name"),
      rawText: z.string().optional().describe("Updated raw resume text"),
      isDefault: z.boolean().optional().describe("Set as default master resume"),
    },
    async (params) => {
      try {
        const result = await client.resume.updateMaster(params.id, {
          label: params.label,
          rawText: params.rawText,
          isDefault: params.isDefault,
        } as any);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "master-resume-delete",
    "Delete a master resume by ID.",
    {
      id: z.string().describe("Master resume ID"),
    },
    async (params) => {
      try {
        await client.resume.deleteMaster(params.id);
        return { content: [{ type: "text", text: JSON.stringify({ deleted: true, id: params.id }) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
