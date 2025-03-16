import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { MongoStorage } from "./mongodb";
import { MemStorage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function initializeStorage() {
  if (process.env.MONGODB_URI) {
    log("MongoDB URI found, attempting to connect...");
    const storage = new MongoStorage(process.env.MONGODB_URI);

    try {
      // Add 5 second timeout for MongoDB connection
      await Promise.race([
        storage.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("MongoDB connection timeout")), 5000)
        )
      ]);

      log("Successfully connected to MongoDB");
      return storage;
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      log("Falling back to MemStorage");
    }
  } else {
    log("No MongoDB URI found, using MemStorage");
  }

  return new MemStorage();
}

async function startServer() {
  log("Starting server initialization...");

  const storage = await initializeStorage();

  log("Setting up routes...");
  const server = await registerRoutes(app, storage);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Error:", err);
    res.status(status).json({ message });
  });

  // Force development mode for now
  process.env.NODE_ENV = "development";

  // Initialize frontend
  log("Setting up frontend...");
  try {
    log("Initializing Vite development server...");
    await setupVite(app, server);
    log("Vite development server initialized");
  } catch (error) {
    console.error("Failed to initialize Vite:", error);
    process.exit(1);
  }

  const port = process.env.PORT || 5000;

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      log(`Server listening on port ${port}`);
      resolve(server);
    }).on('error', (err) => {
      log(`Failed to start server: ${err.message}`);
      reject(err);
    });
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});