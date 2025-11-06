import { DataTypes, Optional, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import { SubdivisionType } from "../interfaces/Subdivisions.js";

interface SubdivisionCreationAttributes
  extends Optional<SubdivisionType, "subdivision_id"> {}

class Subdivision
  extends Model<SubdivisionType, SubdivisionCreationAttributes>
  implements SubdivisionType
{
  declare subdivision_id: number;
  declare subdivision_name: string;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

Subdivision.init(
  {
    subdivision_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    subdivision_name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "subdivision",
    timestamps: true,
    underscored: true,
  }
);

export { Subdivision };
