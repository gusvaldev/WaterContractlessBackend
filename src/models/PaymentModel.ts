import { DataTypes, Optional, Model } from "sequelize";
import { sequelize } from "../config/database";
import { PaymentType } from "../interfaces/Payment";
import { User } from "./User";
import { Street } from "./StreetModel";
import { Subdivision } from "./SubdivisionModel";

interface PaymentCreationAttributes
  extends Optional<PaymentType, "payment_id"> {}

class Payment
  extends Model<PaymentType, PaymentCreationAttributes>
  implements PaymentType
{
  declare payment_id: number;
  declare subdivision_id: number;
  declare street_id: number;
  declare house_id: number;
  declare house_number: string;
  declare importe: number;
  declare cobrador_id: number;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

Payment.init(
  {
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subdivision_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "subdivision",
        key: "subdivision_id",
      },
    },
    street_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "street",
        key: "street_id",
      },
    },
    house_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    house_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    importe: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cobrador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "user_id",
      },
    },
  },
  {
    sequelize,
    tableName: "payment",
    underscored: true,
    timestamps: true,
  }
);

// Establecer relaciones para obtener datos completos
Payment.belongsTo(User, {
  foreignKey: "cobrador_id",
  as: "cobrador",
});

Payment.belongsTo(Street, {
  foreignKey: "street_id",
  as: "street",
});

Payment.belongsTo(Subdivision, {
  foreignKey: "subdivision_id",
  as: "subdivision",
});

export { Payment };
