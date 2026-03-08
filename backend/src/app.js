const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const { ZodError } = require("zod");
const env = require("./config/env");
const routes = require("./routes");
const webhooksRoutes = require("./routes/webhooks.routes");
const { swaggerSpec } = require("./docs/swagger");
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

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Crane Services API is running",
    docs: "/api/docs",
    health: "/api/health"
  });
});

app.get("/api/docs.json", (_req, res) => {
  res.json(swaggerSpec);
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
