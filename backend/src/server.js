require("./config/env");
const env = require("./config/env");
const { initDb } = require("./db/init");
const { app } = require("./app");

async function start() {
  await initDb();
  app.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
