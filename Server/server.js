
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const productRoutes = require("./routes/productRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");

console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/products", productRoutes);
app.use("/api/lost-found", lostFoundRoutes);

// Server Configuration
const PORT = process.env.PORT || 5000;
const MongoDb_URI = process.env.MongoDb_URI;

// Home Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusConnect server is running",
    port: PORT,
  });
});

// Start Server
async function startServer() {
  try {
    if (!MongoDb_URI) {
      throw new Error("MongoDb_URI is missing in .env");
    }

    await mongoose.connect(MongoDb_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Connection error:", error.message);
    process.exit(1);
  }
}

startServer();
