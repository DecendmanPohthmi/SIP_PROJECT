import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import organiserRoutes from "./routes/organiserRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";


dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/",(req,res)=>{

    res.send("Server Running");

});

app.use("/api/user",userRoutes);
app.use("/api/organiser", organiserRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/events", eventRoutes);

// 404 handler — catches any route that doesn't match above
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler — catches anything thrown/rejected in middleware or controllers
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(err.http_code || err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong.",
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT,()=>{

    console.log(`Server running on ${PORT}`);

});