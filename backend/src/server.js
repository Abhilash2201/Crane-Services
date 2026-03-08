require("./config/env");
const http = require("http");
const env = require("./config/env");
const { initDb } = require("./db/init");
const { app } = require("./app");
const { createSocketServer } = require("./sockets");

async function start() {
  await initDb();
  const server = http.createServer(app);
  const io = createSocketServer(server, env.frontendOrigins);
  app.set("io", io);

  server.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
