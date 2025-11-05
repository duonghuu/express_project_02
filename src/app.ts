import express, { Application } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import router from "@routes/index"
import { connectDB } from "@config/database";
import { getEnv } from "@utils/getEnv";

dotenv.config();

const app: Application = express();
// Middleware
app.use(helmet());             // helmet header
// === Setup log file ===
// const logDir = path.join(process.cwd(), "logs");
// if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
// const logFile = path.join(logDir, "access.log");
// const logStream = fs.createWriteStream(logFile, { flags: "a" });
// app.use(morgan("combined", { stream: logStream }));
app.use(morgan("dev")); // log request to console
app.use(express.json());

// router
app.use("/", router);

(async () => {
  try {
    await connectDB();
    const port = getEnv('PORT', '3000');
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
})();
