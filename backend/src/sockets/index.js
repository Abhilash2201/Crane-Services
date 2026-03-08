const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const { sql } = require("../db/neon");

function createSocketServer(httpServer, corsOrigins) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.user = { role: "guest" };
      return next();
    }
    try {
      socket.user = verifyToken(token);
      return next();
    } catch (_error) {
      return next(new Error("Unauthorized socket token"));
    }
  });

  io.on("connection", (socket) => {
    if (socket.user?.userId) {
      socket.join(`user:${socket.user.userId}`);
      socket.join(`role:${socket.user.role}`);
    }

    socket.on("join:job", (jobId) => {
      if (typeof jobId !== "string" || !jobId) return;
      socket.join(`job:${jobId}`);
    });

    socket.on("leave:job", (jobId) => {
      if (typeof jobId !== "string" || !jobId) return;
      socket.leave(`job:${jobId}`);
    });

    socket.on("tracking:update", async (payload) => {
      try {
        if (!socket.user?.userId || socket.user.role !== "driver") return;
        const { jobId, latitude, longitude, speedKmph, heading } = payload || {};
        if (!jobId) return;

        const job = await sql`
          SELECT id FROM jobs WHERE id = ${jobId} AND driver_id = ${socket.user.userId} LIMIT 1
        `;
        if (!job.length) return;

        const rows = await sql`
          INSERT INTO tracking_events (job_id, driver_id, latitude, longitude, speed_kmph, heading)
          VALUES (${jobId}, ${socket.user.userId}, ${latitude}, ${longitude}, ${speedKmph || null}, ${heading || null})
          RETURNING id, job_id, driver_id, latitude, longitude, speed_kmph, heading, captured_at
        `;
        const event = rows[0];
        io.to(`job:${jobId}`).emit("tracking:updated", event);
        io.to("role:admin").emit("tracking:updated", event);
      } catch (error) {
        socket.emit("tracking:error", { message: error.message || "Tracking update failed" });
      }
    });
  });

  return io;
}

module.exports = { createSocketServer };
