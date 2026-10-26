import { generateText, type LanguageModel } from "ai";
import { opencode } from "ai-sdk-provider-opencode-sdk";

export interface PolishOptions {
  model?: LanguageModel;
}

export async function polishDescription(
  description: string,
  options?: PolishOptions,
): Promise<string> {
  const model = options?.model ?? opencode("default");
  const { text } = await generateText({
    model,
    prompt: `Please polish and enhance this homestay listing description to make it appealing, professional, and clear:\n\n${description}`,
    system:
      "You are an expert homestay copywriter. Polish and elevate the description while keeping factual details accurate.",
  });
  return text;
}

async function main() {
  const input =
    process.argv.slice(2).join(" ") ||
    "Cozy 2 bedroom homestay near the beach with fast wifi and kitchen.";
  const polished = await polishDescription(input);
  process.stdout.write(polished + "\n");
}

if (process.argv[1]?.includes("polish.ts")) {
  main().catch((err) => {
    process.stderr.write(`Failed to polish description: ${err.message}\n`);
    process.exit(1);
  });
}
