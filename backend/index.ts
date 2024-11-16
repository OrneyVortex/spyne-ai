import express from "express";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db";
import { userRoute } from "./routes/user";
import { carRoute } from "./routes/car";
import swaggerUi from "swagger-ui-express";
import path from "path";
import YAML from 'yamljs';
import cors from "cors"
import cookieParser from "cookie-parser";
// configure dotenv to access environment variables

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(cookieParser());
connectDB();

app.use(express.json());

// Serve static files (if any) such as images in the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")))

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
console.log(path.join(__dirname,'swagger.yaml'));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use("/api/users", userRoute); // User routes for signup and login
app.use("/api/cars", carRoute); // Car routes for CRUD operations

app.get("/", (req, res) => {
  res.send("HealthCheck OK");
})
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
