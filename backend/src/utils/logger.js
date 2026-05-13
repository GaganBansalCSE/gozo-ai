const levels = ["error", "warn", "info", "debug"];
const configuredLevel = process.env.LOG_LEVEL || "info";

function shouldLog(level) {
  return levels.indexOf(level) <= levels.indexOf(configuredLevel);
}

function print(level, message, meta = {}) {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

module.exports = {
  error: (message, meta) => print("error", message, meta),
  warn: (message, meta) => print("warn", message, meta),
  info: (message, meta) => print("info", message, meta),
  debug: (message, meta) => print("debug", message, meta),
};
