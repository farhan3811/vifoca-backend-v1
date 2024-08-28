import { Sequelize } from "sequelize";

const db = new Sequelize('vifocaa', 'postgres', 'wartam7317', {
    host: "localhost",
    dialect: "postgres"
});

export default db;
