import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LLMConveyors } from "llmconveyors";
import { z } from "zod";

export function registerReferralTools(server: McpServer, client: LLMConveyors): void {
  server.tool(
    "referral-stats",
    "Get referral program statistics including total referrals and credits earned.",
    {},
    async () => {
      try {
        const result = await client.referral.getStats();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "referral-code",
    "Get your referral code for sharing with others.",
    {},
    async () => {
      try {
        const result = await client.referral.getCode();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );

  server.tool(
    "referral-vanity-code",
    "Set a custom vanity code for your referral link.",
    {
      code: z.string().describe("Custom vanity code to set"),
    },
    async (params) => {
      try {
        const result = await client.referral.setVanityCode({ code: params.code });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    },
  );
}
