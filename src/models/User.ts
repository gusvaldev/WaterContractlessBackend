import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";
import { UserType } from "../interfaces/types.js";

interface UserCreationAttributes extends Optional<UserType, "id"> {}

class User extends Model<UserType, UserCreationAttributes> implements UserType {
  declare id: number;
  declare name: string;
  declare lastname: string;
  declare username: string;
  declare password: string;
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
    username: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
