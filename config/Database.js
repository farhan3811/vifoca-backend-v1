import { Sequelize } from "sequelize";

const db = new Sequelize(
    'vifocaa',   // nama db
    'postgres', // username
    'wartam7317', // password
    {
    host: "localhost",
    dialect: "postgres"
});

export default db;
