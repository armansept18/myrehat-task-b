import { beforeEach, describe, expect, it, vi } from "vitest";
import { polishDescription } from "../scripts/polish";

const mockGenerateText = vi.fn();

vi.mock("ai", async () => {
  const actual = await vi.importActual<typeof import("ai")>("ai");
  return {
    ...actual,
    generateText: (...args: unknown[]) => mockGenerateText(...args),
  };
});

vi.mock("ai-sdk-provider-opencode-sdk", () => {
  const mockOpencode = vi.fn().mockImplementation((modelId: string) => ({
    modelId,
    provider: "opencode",
  }));
  return {
    opencode: mockOpencode,
    createOpencode: vi.fn().mockReturnValue(mockOpencode),
  };
});

describe("scripts/polish.ts - Polish Listing Description", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls generateText with opencode model and returns polished description", async () => {
    const rawInput = "homestay near beach 2 rooms wifi clean";
    const expectedOutput =
      "Stunning 2-bedroom coastal sanctuary located steps away from the beach, featuring high-speed WiFi and spotless modern amenities.";

    mockGenerateText.mockResolvedValueOnce({
      text: expectedOutput,
    });

    const result = await polishDescription(rawInput);

    expect(mockGenerateText).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateText.mock.calls[0][0];
    expect(callArgs.prompt).toContain(rawInput);
    expect(callArgs.system).toContain("homestay copywriter");
    expect(callArgs.model).toBeDefined();
    expect(callArgs.model.provider).toBe("opencode");
    expect(result).toBe(expectedOutput);
  });

  it("supports passing custom model options", async () => {
    const customModel: any = {
      modelId: "custom-opencode-v2",
      provider: "custom",
    };
    mockGenerateText.mockResolvedValueOnce({ text: "Custom polished text" });

    const result = await polishDescription("raw description", {
      model: customModel,
    });

    expect(mockGenerateText).toHaveBeenCalledTimes(1);
    expect(mockGenerateText.mock.calls[0][0].model).toBe(customModel);
    expect(result).toBe("Custom polished text");
  });
});
