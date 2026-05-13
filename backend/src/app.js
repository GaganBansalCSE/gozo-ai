const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");
const notFoundMiddleware = require("./middlewares/notFound.middleware");
const logger = require("./utils/logger");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("tiny", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use("/api", routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
