import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { handleToolError } from "../utils/error-handler.js";

export function registerHealthTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "health-root",
    "Get API root info (name, version). Public endpoint, no auth required.",
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
    "Check API health status — returns status, timestamp, uptime, version, checks, memory. Public endpoint, no auth required.",
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
    "Check API readiness. Public endpoint, no auth required.",
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
    "Check API liveness. Public endpoint, no auth required.",
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
