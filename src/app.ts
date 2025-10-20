import express, { Application } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import router from "@routes/index"
import { connectDB } from "@config/database";

dotenv.config();

const app: Application = express();
// Middleware
app.use(helmet());             // helmet header
app.use(morgan("dev"));        // log request to console
app.use(express.json());

app.use("/", router);

(async () => {
  try {
    const db = await connectDB();

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
})();
