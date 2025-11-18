// Backend/app.js
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
connectDB();

// === Middlewares ===
const sellerMiddleware = require("./middlewares/seller.middleware");
const auctionManagerMiddleware = require("./middlewares/auction_manager.middleware");
import buyerMiddleware from "./middlewares/buyer.middleware.js";

// === Routes ===
const sellerRoutes = require("./routes/seller.routes");
const auctionManagerRoutes = require("./routes/auctionManager.routes");
const mechanicRoutes = require("./routes/mechanic.routes");
const app = express();

// === CORS Configuration ===
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow non-browser clients
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// === Body Parsers & Static Files ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// === API ROUTES ===


app.use("/api/seller", sellerMiddleware, sellerRoutes);
app.use("/api/buyer", buyerMiddleware, buyerRoutes);

// Auction Manager API (Protected)
app.use("/api/auction-manager", auctionManagerMiddleware, auctionManagerRoutes);

// === PRODUCTION: Serve Frontend Build (React/Vite/etc.) ===
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "..", "client", "dist");

  if (require("fs").existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));

    // Catch-all: Serve index.html for SPA routing
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
      }
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });

    console.log("Serving client build from:", clientBuildPath);
  } else {
    console.warn("Client build not found at:", clientBuildPath);
  }
}

// === 404 for API routes ===
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// === Start Server ===
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;