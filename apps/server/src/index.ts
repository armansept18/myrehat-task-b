import { google } from "@ai-sdk/google";
import { cors } from "@elysiajs/cors";
import { processWahaMessage } from "@myrehat-task-b/api";
import { appRouter } from "@myrehat-task-b/api/routers/index";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type LanguageModel,
  type ModelMessage,
  type UIMessage,
  type UIMessageStreamWriterWithOutcome,
} from "ai";
import { Elysia } from "elysia";

type StreamWriter = UIMessageStreamWriterWithOutcome<UIMessage>;

import { createContext } from "./context";
import { ENV } from "./env.server";
import { auth } from "./services";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

function writeAssistantTextMessage(
  writer: StreamWriter,
  text: string,
) {
  const id = `msg-${Date.now()}`;
  writer.write({ type: "start", messageId: id });
  writer.write({ type: "text-start", id });
  writer.write({ type: "text-delta", id, delta: text });
  writer.write({ type: "text-end", id });
  writer.write({ type: "finish" });
}

function getCandidateModels(): LanguageModel[] {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey && !openrouterKey.includes("dummy") && openrouterKey.length > 10) {
    const openrouter = createOpenRouter({ apiKey: openrouterKey });
    const configuredModel = process.env.OPENROUTER_MODEL;
    const defaultModels = [
      "google/gemini-2.0-flash-001",
      "google/gemini-2.5-flash",
      "meta-llama/llama-3.3-70b-instruct",
    ];
    const modelNames = configuredModel
      ? [configuredModel, ...defaultModels.filter((m) => m !== configuredModel)]
      : defaultModels;
    return modelNames.map((name) => openrouter(name));
  }

  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (
    googleKey &&
    !googleKey.toLowerCase().includes("dummy") &&
    googleKey !== "your-google-api-key" &&
    googleKey.length > 20
  ) {
    return [google("gemini-2.5-flash")];
  }

  return [];
}

async function streamModelWithReader(
  model: LanguageModel,
  modelMessages: ModelMessage[],
  writer: StreamWriter,
): Promise<boolean> {
  const result = streamText({
    model,
    messages: modelMessages,
    maxRetries: 0,
    onError: () => {},
  });

  const uiStream = toUIMessageStream({ stream: result.stream });
  const reader = uiStream.getReader();
  let hasWritten = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      writer.write(value);
      hasWritten = true;
    }
  } finally {
    reader.releaseLock();
  }
  return hasWritten;
}

function createErrorUIStream(message: string) {
  return createUIMessageStream({
    execute: async ({ writer }) => {
      writeAssistantTextMessage(writer, message);
    },
  });
}

new Elysia()
  .use(
    cors({
      origin: ENV.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .all(
    "/rpc*",
    async (context) => {
      const { response } = await rpcHandler.handle(context.request, {
        prefix: "/rpc",
        context: await createContext({ context }),
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .all(
    "/api-reference*",
    async (context) => {
      const { response } = await apiHandler.handle(context.request, {
        prefix: "/api-reference",
        context: await createContext({ context }),
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .post("/ai", async (context) => {
    const body = (await context.request.json()) as { messages?: UIMessage[] };
    const uiMessages = body.messages || [];
    const models = getCandidateModels();

    if (models.length === 0) {
      const stream = createErrorUIStream(
        "⚠️ AI API key is not configured or is invalid. Please set a valid `OPENROUTER_API_KEY` (or `GOOGLE_GENERATIVE_AI_API_KEY`) in `apps/server/.env.local` to start chatting.",
      );
      return createUIMessageStreamResponse({ stream });
    }

    const modelMessages = await convertToModelMessages(uiMessages);

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        let lastErrorMessage = "";
        for (const model of models) {
          try {
            const streamed = await streamModelWithReader(model, modelMessages, writer);
            if (streamed) {
              return;
            }
          } catch (err: any) {
            lastErrorMessage = err?.message || "Rate-limited upstream";
          }
        }

        writeAssistantTextMessage(
          writer,
          `⚠️ AI Notice: ${lastErrorMessage}. If upstream rate limits occur, try switching \`OPENROUTER_MODEL=google/gemini-2.0-flash-001\` or \`OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct\` in \`apps/server/.env.local\`.`,
        );
      },
    });

    return createUIMessageStreamResponse({ stream });
  })
  .post("/api/webhooks/waha", async (context) => {
    let rawBody: unknown;
    try {
      rawBody = await context.request.json();
    } catch {
      return context.status(400, { error: "Invalid JSON payload" });
    }
    const result = await processWahaMessage(rawBody);
    return context.status(result.status as any, result.data);
  })
  .get("/", () => "OK")
  .listen(3000);
