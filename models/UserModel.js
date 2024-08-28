import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Users = db.define('users', {
    uuid: {
        type: DataTypes.STRING,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 100]
        }
    },
    prodi: {
        type: DataTypes.STRING
    },
    nim: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true, 
        validate: {
            notEmpty: true,
            isNumeric: true 
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    avatar: {
        type: DataTypes.TEXT
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    biodata_id: {
        type: DataTypes.BIGINT
    }
}, {
    freezeTableName: true,
    timestamps: true,
    underscored: true,
    createdAt: 'createdat', 
    updatedAt: 'updatedat' 
});

export default Users;
