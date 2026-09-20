export type Config = {
    port: number;
    geminiApiKey: string | null;
    geminiModal: string;
    generationTimeoutMs: number;
    maxGenerationAttemps: number;
}

function isValidNumber(value: string | undefined): boolean {
    if(value === undefined || value === "") return false;
    const parsed = Number(value);
    return !Number.isNaN(parsed) && Number.isFinite(parsed);
}

export function appConfig(env: Record<string,string | undefined>): Config {
    const key = env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== "" ? env.GEMINI_API_KEY.trim() : null;
    const modal = env.GEMINI_MODEL && env.GEMINI_MODEL.trim() !== "" ? env.GEMINI_MODEL.trim() : "gemini-2.5-flash";
    return {
        port: isValidNumber(env.PORT) ? Number(env.PORT) : 8787,
        geminiApiKey: key,
        geminiModal: modal,
        generationTimeoutMs: isValidNumber(env.GENERATION_TIMEOUT_MS) ? Number(env.GENERATION_TIMEOUT_MS) : 45_000,
        maxGenerationAttemps: isValidNumber(env.MAX_GENERATION_ATTEMPTS) ? Number(env.MAX_GENERATION_ATTEMPTS) : 3,
    }
}
