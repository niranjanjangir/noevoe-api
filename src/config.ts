export type Config = {
    port: number;
    geminiApiKey: string | null;
    geminiModel: string;
    groqApiKey: string | null;
    groqModel: string;
    generationTimeoutMs: number;
    maxGenerationAttempts: number;
}

function isValidNumber(value: string | undefined): boolean {
    if(value === undefined || value === "") return false;
    const parsed = Number(value);
    return !Number.isNaN(parsed) && Number.isFinite(parsed);
}

export function appConfig(env: Record<string,string | undefined>): Config {
    const key = env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== "" ? env.GEMINI_API_KEY.trim() : null;
    const model = env.GEMINI_MODEL && env.GEMINI_MODEL.trim() !== "" ? env.GEMINI_MODEL.trim() : "gemini-3.1-flash-lite";
    const groqKey = env.GROQ_API_KEY && env.GROQ_API_KEY.trim() !== "" ? env.GROQ_API_KEY.trim() : null;
    const groqModel = env.GROQ_MODEL && env.GROQ_MODEL.trim() !== "" ? env.GROQ_MODEL.trim() : "openai/gpt-oss-120b";
    return {
        port: isValidNumber(env.PORT) ? Number(env.PORT) : 8787,
        geminiApiKey: key,
        geminiModel: model,
        groqApiKey: groqKey,
        groqModel,
        generationTimeoutMs: isValidNumber(env.GENERATION_TIMEOUT_MS) ? Number(env.GENERATION_TIMEOUT_MS) : 45_000,
        maxGenerationAttempts: isValidNumber(env.MAX_GENERATION_ATTEMPTS) ? Number(env.MAX_GENERATION_ATTEMPTS) : 3,
    }
}
