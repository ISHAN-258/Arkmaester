import "./env.js";
import express from "express";
import cors from "cors";
import { connectDb, closeDb } from "./db.js";
import dataRoutes from "./routes/data.js";

const PORT = Number(process.env.PORT) || 3001;

async function main() {
  let mongoReady = false;
  try {
    await connectDb();
    mongoReady = true;
  } catch (e) {
    console.error("\n[arkmaester] MongoDB connection failed:", e.message);
    console.error("Fix MONGODB_PASSWORD in .env, then restart.\n");
  }

  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", async (_req, res) => {
    if (!mongoReady) {
      return res.status(503).json({ ok: false, error: "MongoDB not connected" });
    }
    try {
      const database = await connectDb();
      const ping = await database.command({ ping: 1 });
      res.json({ ok: true, mongodb: ping.ok === 1 });
    } catch (e) {
      res.status(503).json({ ok: false, error: e.message });
    }
  });

  app.use("/api/data", (req, res, next) => {
    if (!mongoReady) {
      return res.status(503).json({ error: "MongoDB not connected" });
    }
    next();
  }, dataRoutes);

  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    console.error(err);
    res.status(status).json({ error: err.message || "Internal server error" });
  });

  const server = app.listen(PORT, () => {
    console.log(`Arkmaester API listening on http://localhost:${PORT}`);
    if (mongoReady) {
      console.log("Writes go to Atlas → database arkmaester → collection appdata");
    }
  });

  const shutdown = async () => {
    server.close();
    await closeDb();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await new Promise((resolve) => server.on("close", resolve));
}

main().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
