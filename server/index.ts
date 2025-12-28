import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// Global error handlers to ensure crashes are logged clearly in hosting logs
process.on("uncaughtException", (err) => {
  // eslint-disable-next-line no-console
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.use(cors({
  origin: [
    'https://ak-business-club-u4vk.vercel.app/',
    'http://localhost:3000', // for local development
  ],
  credentials: true,
}));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Log presence of key environment variables to aid debugging on platforms like Railway
    // eslint-disable-next-line no-console
    console.log("ENV: DATABASE_URL=" + (process.env.DATABASE_URL ? "(present)" : "(missing)"));
    // eslint-disable-next-line no-console
    console.log("ENV: SESSION_SECRET=" + (process.env.SESSION_SECRET ? "(present)" : "(missing)"));

    await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || '0.0.0.0';

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  httpServer.listen(
    {
      port: PORT,
      host: HOST,
      reusePort: true,
    },
    () => {
      log(`serving on port ${PORT}`);
    },
  );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
})();
