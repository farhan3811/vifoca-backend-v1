// src/models/PenilaianModel.js
import db from "../config/Database.js";
import Tugas from "./TugasModel.js";
import Users from "./UserModel.js";
import { Sequelize } from "sequelize";

const { DataTypes } = Sequelize;

const Penilaian = db.define('Penilaian', {
    id: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    tugas_id: {
        type: DataTypes.STRING
    },
    form_penilaian: {
        type: DataTypes.STRING
    },
    answer: {
        type: DataTypes.TEXT
    },
    ket_penilaian: {
        type: DataTypes.TEXT
    },
    createdat: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedat: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createdat', 
    updatedAt: 'updatedat' 
});
Users.hasMany(Penilaian, { foreignKey: 'userId' });
Penilaian.belongsTo(Users, { foreignKey: 'userId' });

Tugas.hasMany(Penilaian, { foreignKey: 'tugas_id' });
Penilaian.belongsTo(Tugas, { foreignKey: 'tugas_id' });

export default Penilaian;
