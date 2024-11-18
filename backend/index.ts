import express from "express";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db";
import { userRoute } from "./routes/user";
import { carRoute } from "./routes/car";
import swaggerUi from "swagger-ui-express";
import path from "path";
import YAML from 'yamljs';
import cors from "cors";
import cookieParser from "cookie-parser";

// Initialize Express app
const app = express();

// Define allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://spyne-ai-frontend-production.up.railway.app"
];

// Configure CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or CURL requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allows cookies to be sent with requests
}));

app.use(cookieParser());
connectDB();

app.use(express.json());

// Serve static files (e.g., images) in the uploads and public directories
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

// Swagger setup
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
console.log(path.join(__dirname, 'swagger.yaml'));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Define API routes
app.use("/api/users", userRoute); // User routes for signup and login
app.use("/api/cars", carRoute); // Car routes for CRUD operations

// Health check endpoint
app.get("/", (req, res) => {
  res.send("HealthCheck OK");
});

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
