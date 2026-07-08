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

const PORT = process.env.PORT || 4000;

app.listen(PORT,()=>{

    console.log(`Server running on ${PORT}`);

});