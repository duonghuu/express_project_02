import "reflect-metadata";
import { DataSource } from "typeorm";
import { Product } from "@models/Product"
import path from "path";

let dataSource: DataSource;

export const connectDB = async (): Promise<DataSource> => {
    if (dataSource && dataSource.isInitialized) {
        return dataSource;
    }
    const dbPath = path.resolve(__dirname, "../../database.sqlite"); // file db nằm ở root

    dataSource = new DataSource({
        type: "better-sqlite3",
        database: dbPath,
        // host: process.env.DB_HOST || "localhost",
        // port: Number(process.env.DB_PORT) || 3306,
        // username: process.env.DB_USER || "root",
        // password: process.env.DB_PASS || "",
        // database: process.env.DB_NAME || "testdb",
        synchronize: true,
        logging: false,
        entities: [Product]
        // migrations: ["src/database/migrations/*.ts"],
    });

    await dataSource.initialize();
    console.log("✅ Database connected");
    return dataSource;
};
