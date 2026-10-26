import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { z } from "zod";

export const wahaPayloadSchema = z.object({
  event: z.string().trim().min(1, "Event is required"),
  payload: z.object({
    from: z.string().trim().min(1, "From is required"),
    body: z.string().trim().min(1, "Body is required"),
  }),
});

export type WahaPayload = z.infer<typeof wahaPayloadSchema>;

export interface WahaWebhookResult {
  status: number;
  data: {
    to?: string;
    reply?: string;
    error?: string;
  };
}

export async function processWahaMessage(
  rawBody: unknown,
): Promise<WahaWebhookResult> {
  const parsed = wahaPayloadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      status: 400,
      data: {
        error:
          "Validation failed: required non-empty event, payload.from, and payload.body",
      },
    };
  }

  const { from, body } = parsed.data.payload;
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  const modelName = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

  try {
    const openrouter = createOpenRouter({ apiKey });
    const model = openrouter(modelName);

    const { text } = await generateText({
      model,
      prompt: body,
    });

    return {
      status: 200,
      data: {
        to: from,
        reply: text,
      },
    };
  } catch (err: any) {
    return {
      status: 500,
      data: {
        error: `AI generation failed: ${err?.message || "Unknown error"}`,
      },
    };
  }
}

