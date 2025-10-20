import { DataTypes, Optional, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import { House } from "./HouseModel.js";
import { Reports } from "../interfaces/Reports.js";

interface ReportCreationAttributes extends Optional<Reports, "report_id"> {}

class Report
  extends Model<Reports, ReportCreationAttributes>
  implements Reports
{
  declare report_id: number;
  declare report_date: Date;
  declare comments: string | null;
  declare house_id: number;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

Report.init(
  {
    report_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    report_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    house_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "house",
        key: "house_id",
      },
    },
  },
  {
    sequelize,
    tableName: "reports",
    timestamps: true,
    underscored: true,
  }
);

Report.belongsTo(House, {
  foreignKey: "house_id",
  as: "house",
});

House.hasMany(Report, {
  foreignKey: "house_id",
  as: "reports",
});

export { Report };
