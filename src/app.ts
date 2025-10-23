import express from "express";
import type { Application, Request, Response } from "express";
import { connectDB, syncDB } from "./config/database";
import "./models/index.js";
import { router } from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes.js";
import subdivisionRoutes from "./routes/subdivisionRoutes";
import streetRoutes from "./routes/streetRoutes";
import houseRoutes from "./routes/houseRoutes";
import reportRoutes from "./routes/reportRoutes";
import paymentRoutes from "./routes/paymentRoutes";
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
