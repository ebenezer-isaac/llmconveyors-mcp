import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";
import { handleToolError } from "../utils/error-handler.js";

export function registerReferralTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "referral-stats",
    "Get referral program statistics for the current user, including total referrals, successful conversions, and credits earned. Use this to check referral performance or display earnings. Read-only, no side effects. Requires scope: settings:read. Use referral-code to get the shareable referral link.",
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
    "Get the current user's referral code and shareable referral link. Use this to retrieve the code for sharing with others. Read-only, no side effects. Requires scope: settings:read. To customize the code, use referral-vanity-code. To check referral performance, use referral-stats.",
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
    "Set a custom vanity code for the user's referral link, replacing the auto-generated code. This permanently changes the referral URL. Rate limited: 5 per hour. Requires scope: settings:write. Use referral-code first to see the current code before changing it.",
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
