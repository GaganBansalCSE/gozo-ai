const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { AI_PROVIDERS } = require("../utils/constants");

function ensureProvider(provider) {
  if (!AI_PROVIDERS.includes(provider)) {
    throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }
}

async function askOpenAI(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for openai provider");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const response = await client.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0]?.message?.content || "";
}

async function askGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required for gemini provider");
  }

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-pro";
  const model = client.getGenerativeModel({ model: modelName });
  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
    },
  });

  return response.response.text();
}

async function askLlm(prompt) {
  const provider = process.env.AI_PROVIDER || "openai";
  ensureProvider(provider);

  if (provider === "openai") {
    return askOpenAI(prompt);
  }

  return askGemini(prompt);
}

module.exports = { askLlm };
