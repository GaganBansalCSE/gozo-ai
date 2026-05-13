function sanitizeText(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const cleaned = value.trim();
  return cleaned || fallback;
}

function normalizeTechStack(text = "") {
  const known = [
    "java",
    "c++",
    "javascript",
    "spring",
    "spring boot",
    "node",
    "express",
    "mongodb",
    "react",
    "llm",
    "rag",
    "rest",
  ];

  const source = text.toLowerCase();
  return known.filter((token) => source.includes(token));
}

function inferApplyType(source, url) {
  if (source === "LINKEDIN" && /easy-apply/i.test(url)) {
    return "EASY_APPLY";
  }
  return "MANUAL";
}

module.exports = {
  sanitizeText,
  normalizeTechStack,
  inferApplyType,
};
