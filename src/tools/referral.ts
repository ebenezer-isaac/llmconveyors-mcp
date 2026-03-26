import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerReferralTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "referral-stats",
    "Get referral program statistics including total referrals and credits earned. Requires scope: settings:read.",
    {},
    async () => {
      try {
        const result = await client.referral.getStats();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "referral-code",
    "Get your referral code for sharing with others. Requires scope: settings:read.",
    {},
    async () => {
      try {
        const result = await client.referral.getCode();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.tool(
    "referral-vanity-code",
    "Set a custom vanity code for your referral link. Rate limited: 5 per hour. Requires scope: settings:write.",
    {
      code: z.string().describe("Custom vanity code to set"),
    },
    async (params) => {
      try {
        const result = await client.referral.setVanityCode({ code: params.code });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
