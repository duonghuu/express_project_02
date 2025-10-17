import express, { Application } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import router from "@routes/index"

dotenv.config();

const app: Application = express();
// Middleware
app.use(helmet());             // helmet header
app.use(morgan("dev"));        // log request to console
app.use(express.json());

app.use("/", router);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
