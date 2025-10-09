import { DataTypes, Optional, Model } from "sequelize";
import { sequelize } from "../config/database";
import { HouseType } from "../interfaces/House";
import { Street } from "./StreetModel";

interface HouseCreationAttributes extends Optional<HouseType, "house_id"> {}

class House
  extends Model<HouseType, HouseCreationAttributes>
  implements HouseType
{
  declare house_id: number;
  declare house_number: string;
  declare inhabited: "0" | "1";
  declare water: "0" | "1";
  declare street_id: number;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

House.init(
  {
    house_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    house_number: {
      type: DataTypes.STRING,
    },
    inhabited: {
      type: DataTypes.ENUM("0", "1"),
    },
    water: {
      type: DataTypes.ENUM("0", "1"),
    },
    street_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "street",
        key: "street_id",
      },
    },
  },
  {
    sequelize,
    tableName: "house",
    underscored: true,
    timestamps: true,
  }
);

House.belongsTo(Street, {
  foreignKey: "street_id",
  as: "street",
});

Street.hasMany(House, {
  foreignKey: "street_id",
  as: "houses",
});

export { House };
