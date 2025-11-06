import express from "express";
import type { Application, Request, Response } from "express";
import { connectDB, syncDB } from "./config/database.js";
import "./models/index.js";
import { router } from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import subdivisionRoutes from "./routes/subdivisionRoutes.js";
import streetRoutes from "./routes/streetRoutes.js";
import houseRoutes from "./routes/houseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cors from "cors";

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*", credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api", router);
app.use("/api", subdivisionRoutes);
app.use("/api", streetRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", paymentRoutes);

const startServer = async () => {
  try {
    await connectDB();
    await syncDB();

    app.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running" });
});

export { app };
