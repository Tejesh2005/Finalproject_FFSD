// Backend/app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import morgan from "morgan";
import helmet from "helmet";
import { createStream } from "rotating-file-stream";
import fs from "fs";

import connectDB from "./config/db.js";
import "./models/User.js";
import "./models/RentalRequest.js";
import "./models/AuctionRequest.js";
import "./models/Chat.js";
import "./models/Message.js";
import "./models/InspectionChat.js";
import "./models/InspectionMessage.js";

import authRoutes from "./routes/auth.routes.js";
import homeRoutes from "./routes/home.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import auctionManagerRoutes from "./routes/auctionManager.routes.js";
import mechanicRoutes from "./routes/mechanic.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import buyerRoutes from "./routes/buyer.routes.js";
import chatRoutes from './routes/chat.routes.js';
import inspectionChatRoutes from './routes/inspectionChat.routes.js';

import sellerMiddleware from "./middlewares/seller.middleware.js";
import mechanicMiddleware from "./middlewares/mechanic.middleware.js";
import adminMiddleware from "./middlewares/admin.middleware.js";
import auctionManagerMiddleware from "./middlewares/auction_manager.middleware.js";
import buyerMiddleware from "./middlewares/buyer.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Create logs directory if needed
const logsDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

// Filename generators for rotating logs
const pad = (num) => (num > 9 ? num : `0${num}`);

const accessGenerator = (time) => {
  if (!time) return "access.log";
  const year = time.getFullYear();
  const month = pad(time.getMonth() + 1);
  const day = pad(time.getDate());
  return `access-${year}${month}${day}.log`;
};

const errorGenerator = (time) => {
  if (!time) return "error.log";
  const year = time.getFullYear();
  const month = pad(time.getMonth() + 1);
  const day = pad(time.getDate());
  return `error-${year}${month}${day}.log`;
};

// Rotating log streams
const accessLogStream = createStream(accessGenerator, {
  interval: "1d",
  path: logsDirectory,
  maxFiles: 14,
  compress: "gzip",
});

const errorLogStream = createStream(errorGenerator, {
  interval: "1d",
  path: logsDirectory,
  maxFiles: 30,
  compress: "gzip",
});

// Morgan middlewares
app.use(morgan("dev", {
  skip: (req) => (
    req.url.includes('/notifications') ||
    req.url.includes('/auction/') ||
    req.url.includes('/buyer/dashboard') ||
    req.url.includes('/wishlist')
  )
}));

app.use(morgan("combined", { stream: accessLogStream }));

app.use(morgan("combined", {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400
}));

// Security & parsing middlewares
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:5173",
    ].filter(Boolean);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS policy: Origin not allowed"));
  },
  credentials: true,
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/seller", sellerMiddleware, sellerRoutes);
app.use("/api/buyer", buyerMiddleware, buyerRoutes);
app.use("/api/auctionmanager", auctionManagerMiddleware, auctionManagerRoutes);
app.use("/api/mechanic", mechanicMiddleware, mechanicRoutes);
app.use("/api/admin", adminMiddleware, adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/inspection-chat', inspectionChatRoutes);

// Serve client in production
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "..", "client", "dist");
  (async () => {
    try {
      const fs = await import("fs");
      if (fs.existsSync(clientDistPath)) {
        app.use(express.static(clientDistPath));
        app.get("*", (req, res) => {
          if (req.path.startsWith("/api")) {
            return res.status(404).json({ error: "API route not found" });
          }
          res.sendFile(path.join(clientDistPath, "index.html"));
        });
        console.log("Production mode: Serving client build from", clientDistPath);
      } else {
        console.warn("Client build not found at:", clientDistPath);
      }
    } catch (err) {
      console.error("Error checking client build:", err);
    }
  })();
}

// 404 handler for unmatched API routes
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error("Failed to connect to database or start server:", err);
    process.exit(1);
  }
};

startServer();

export default app;