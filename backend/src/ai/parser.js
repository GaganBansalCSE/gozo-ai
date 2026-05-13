const { z } = require("zod");

const responseSchema = z.object({
  score: z.number().min(0).max(100),
  reason: z.string().min(1),
});

function safeParseAiResponse(text) {
  const jsonText = text
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(jsonText);
  return responseSchema.parse(parsed);
}

module.exports = { safeParseAiResponse };
