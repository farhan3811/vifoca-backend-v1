import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const Materi = db.define('materi', {
    id: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name_materi: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    img_materi: {
        type: DataTypes.TEXT,
    },
    ket_materi: {
        type: DataTypes.TEXT
    },
    vid_materi: {
        type: DataTypes.TEXT
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
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
    updatedAt: 'updatedat'   // Map kolom updatedAt ke updatedat
});

Users.hasMany(Materi);
Materi.belongsTo(Users, { foreignKey: 'userId' });

export default Materi;
