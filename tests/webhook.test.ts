import { processWahaMessage, wahaPayloadSchema } from "@myrehat-task-b/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ai", async () => {
  const actual = await vi.importActual<typeof import("ai")>("ai");
  return {
    ...actual,
    generateText: vi.fn().mockResolvedValue({
      text: "Hello! Welcome to MyRehat. How can I assist you with your homestay booking today?",
    }),
  };
});

vi.mock("@openrouter/ai-sdk-provider", () => ({
  createOpenRouter: vi.fn().mockReturnValue((modelName: string) => ({
    modelId: modelName,
    provider: "openrouter",
  })),
}));

describe("WAHA Webhook Concierge Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Payload Validation", () => {
    it("accepts a valid WAHA payload format", () => {
      const validBody = {
        event: "message",
        payload: {
          from: "60123456789@c.us",
          body: "Hi, I want to book a villa in Penang for next weekend",
        },
      };

      const result = wahaPayloadSchema.safeParse(validBody);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.event).toBe("message");
        expect(result.data.payload.from).toBe("60123456789@c.us");
        expect(result.data.payload.body).toBe(
          "Hi, I want to book a villa in Penang for next weekend",
        );
      }
    });

    it("rejects payload missing event with 400 status", async () => {
      const invalid = {
        payload: {
          from: "60123456789@c.us",
          body: "Hello",
        },
      };

      const result = await processWahaMessage(invalid);
      expect(result.status).toBe(400);
      expect(result.data.error).toBeDefined();
    });

    it("rejects payload missing payload.from with 400 status", async () => {
      const invalid = {
        event: "message",
        payload: {
          body: "Hello",
        },
      };

      const result = await processWahaMessage(invalid);
      expect(result.status).toBe(400);
      expect(result.data.error).toBeDefined();
    });

    it("rejects payload missing payload.body with 400 status", async () => {
      const invalid = {
        event: "message",
        payload: {
          from: "60123456789@c.us",
          body: "",
        },
      };

      const result = await processWahaMessage(invalid);
      expect(result.status).toBe(400);
      expect(result.data.error).toBeDefined();
    });

    it("rejects malformed non-object payload with 400 status", async () => {
      const result = await processWahaMessage("not-json-object");
      expect(result.status).toBe(400);
      expect(result.data.error).toBeDefined();
    });
  });

  describe("Response Format", () => {
    it("returns HTTP 200 with exact { to, reply } format", async () => {
      const validBody = {
        event: "message",
        payload: {
          from: "60198765432@c.us",
          body: "Can I know check-in time?",
        },
      };

      const result = await processWahaMessage(validBody);
      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty("to", "60198765432@c.us");
      expect(result.data).toHaveProperty("reply");
      expect(result.data.reply).toBe(
        "Hello! Welcome to MyRehat. How can I assist you with your homestay booking today?",
      );
    });
  });
});
