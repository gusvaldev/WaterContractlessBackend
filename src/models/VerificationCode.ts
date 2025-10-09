import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";

interface VerificationCodeAttributes {
  id: number;
  userId: number;
  code: string;
  expiresAt: Date;
  createdAt?: Date;
}

interface VerificationCodeCreationAttributes
  extends Optional<VerificationCodeAttributes, "id"> {}

class VerificationCode
  extends Model<VerificationCodeAttributes, VerificationCodeCreationAttributes>
  implements VerificationCodeAttributes
{
  declare id: number;
  declare userId: number;
  declare code: string;
  declare expiresAt: Date;
  declare readonly createdAt: Date;
}

VerificationCode.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
  },
  {
    sequelize,
    tableName: "verification_codes",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);

export { VerificationCode };
