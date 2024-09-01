// src/models/TugasModel.js
import db from "../config/Database.js";
import Materis from "./MateriModel.js";
import Users from "./UserModel.js";
import { Sequelize } from "sequelize";

const { DataTypes } = Sequelize;

const Tugas = db.define('tugas', {
    uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    materi_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Materis,
            key: 'id'
        },
        validate: {
            notEmpty: true
        }
    },
    nama_soal: {
        type: DataTypes.STRING
    },
    status_level: {
        type: DataTypes.STRING
    },
    foto_tugas: {
        type: DataTypes.TEXT
    },
    ket_assigment: {
        type: DataTypes.TEXT
    },
    deadline: {
        type: DataTypes.DATE
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
    createdAt: 'createdat',  // Map kolom createdAt ke createdat
    updatedAt: 'updatedat' 
});

// Definisikan relasi
Users.hasMany(Tugas, { foreignKey: 'userId' });
Tugas.belongsTo(Users, { foreignKey: 'userId' });

Materis.hasMany(Tugas, { foreignKey: 'materi_id' });
Tugas.belongsTo(Materis, { foreignKey: 'materi_id' });

export default Tugas;
