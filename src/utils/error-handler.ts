import { LLMConveyorsError, RateLimitError } from "llmconveyors";

export function handleToolError(err: unknown) {
  if (err instanceof LLMConveyorsError) {
    const payload: Record<string, unknown> = {
      error: err.message,
      code: err.code,
      statusCode: err.statusCode,
      ...(err.hint != null && { hint: err.hint }),
      ...(err.details != null && { details: err.details }),
      ...(err.requestId != null && { requestId: err.requestId }),
      retryable: err.isRetryable(),
    };
    if (err instanceof RateLimitError) {
      if (err.retryAfter != null) payload.retryAfterMs = err.retryAfter;
      if (err.rateLimitInfo != null) payload.rateLimitInfo = err.rateLimitInfo;
    }
    return {
      content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
      isError: true as const,
    };
  }
  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true as const,
  };
}
