// sever.js
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";

// Import routes
import quizRoutes from "./routes/quizRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

// Initialize express app and connect to database
const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Use routes
app.use("/quizzes", quizRoutes);
app.use("/questions", questionRoutes);
app.use("/users", userRoutes);

// Start the server
const port = process.env.PORT || 3001;

app.listen(port, () => console.log(`Server running on port ${port}`));
