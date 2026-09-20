import type { Config } from "../../config";
import { createGeminiProvider, type ContentProvider } from "./geminiProvider";

export function createProvider(config: Config): ContentProvider | null{
  if (config.geminiApiKey) {
    return createGeminiProvider(config.geminiApiKey, config.geminiModel, config.generationTimeoutMs);
  }
  return null;
}
