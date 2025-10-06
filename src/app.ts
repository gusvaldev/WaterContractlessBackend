import express from "express";
import type { Application, Request, Response } from "express";
import { connectDB, syncDB } from "./config/database";

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
