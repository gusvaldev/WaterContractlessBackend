import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";
import { UserType } from "../interfaces/User.js";

interface UserCreationAttributes extends Optional<UserType, "id"> {}

class User extends Model<UserType, UserCreationAttributes> implements UserType {
  declare id: number;
  declare name: string;
  declare lastname: string;
  declare email: string;
  declare username: string;
  declare password: string;
  declare role: "admin" | "inspector" | "cobrador";
  declare isVerified: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "inspector", "cobrador"),
      allowNull: false,
      defaultValue: "inspector",
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: "is_verified",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

export { User };
