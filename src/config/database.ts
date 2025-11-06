import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "mysql",
      logging: process.env.NODE_ENV === "production" ? false : console.log,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      username: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "watercontract",
      dialect: "mysql",
      logging: process.env.NODE_ENV === "production" ? false : console.log,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    return true;
  } catch (error) {
    console.error("Database connection failed :(");
    return false;
  }
};

export const syncDB = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("Database synchronized");
  } catch (error) {
    console.error("Database sync failed:", error);
  }
};

export { sequelize };
