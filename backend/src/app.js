const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { ZodError } = require("zod");
const env = require("./config/env");
const routes = require("./routes");
const webhooksRoutes = require("./routes/webhooks.routes");
const { HttpError } = require("./utils/httpError");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendOrigins,
    credentials: true
  })
);
app.use("/webhooks/stripe", express.raw({ type: "application/json" }));
app.use("/webhooks", webhooksRoutes);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api", routes);

app.use((_req, _res, next) => {
  next(new HttpError(404, "Route not found"));
});

app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
  }
  return errorHandler(err, req, res, next);
});

module.exports = { app };
