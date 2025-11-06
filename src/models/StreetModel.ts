import { DataTypes, Optional, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import { StreetType } from "../interfaces/Street.js";
import { Subdivision } from "./SubdivisionModel.js";

interface StreetCreationAttributes extends Optional<StreetType, "street_id"> {}

class Street
  extends Model<StreetType, StreetCreationAttributes>
  implements StreetType
{
  declare street_id: number;
  declare street_name: string;
  declare subdivision_id: number;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

Street.init(
  {
    street_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    street_name: {
      type: DataTypes.STRING,
    },
    subdivision_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "subdivision",
        key: "subdivision_id",
      },
    },
  },
  {
    sequelize,
    tableName: "street",
    timestamps: true,
    underscored: true,
  }
);

Street.belongsTo(Subdivision, {
  foreignKey: "subdivision_id",
  as: "subdivision",
});

Subdivision.hasMany(Street, {
  foreignKey: "subdivision_id",
  as: "streets",
});

export { Street };
