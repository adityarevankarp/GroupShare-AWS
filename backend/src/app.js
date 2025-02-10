import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import imageRoutes from './routes/imageRoutes.js';


dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);


export default app;
