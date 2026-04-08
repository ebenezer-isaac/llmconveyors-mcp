import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { handleToolError } from "../utils/error-handler.js";

export function registerHealthTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "health-root",
    "Get the LLM Conveyors API server name and version. Use this to verify the MCP server is connected and reachable before running other tools. No authentication required. Returns JSON with name and version fields. For deeper diagnostics, use health-check instead.",
    {},
    async () => {
      try {
        const result = await client.health.root();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "health-check",
    "Run a detailed health check on the LLM Conveyors API, returning status, uptime, version, dependency checks, and memory usage. Use this to diagnose connectivity or performance issues before retrying failed tool calls. No authentication required. For a simple alive/dead check, use health-live instead.",
    {},
    async () => {
      try {
        const result = await client.health.check();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "health-ready",
    "Check whether the LLM Conveyors API is ready to accept requests (all dependencies initialized). Use this in automation pipelines to wait for readiness before sending agent runs. No authentication required. Returns a simple ready/not-ready status. For process liveness only, use health-live instead.",
    {},
    async () => {
      try {
        const result = await client.health.ready();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "health-live",
    "Check whether the LLM Conveyors API process is alive and responding. Use this as a lightweight heartbeat check in monitoring or retry loops. No authentication required. Returns a simple alive status. For dependency-level diagnostics, use health-check instead.",
    {},
    async () => {
      try {
        const result = await client.health.live();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
