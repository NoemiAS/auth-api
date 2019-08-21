// const environment = process.env.NODE_ENV || 'development';
const config = require('./../config').appConfig(process.env.NODE_ENV).database;

const environmentConfig = {
    client: 'pg',
    connection: `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`,
};
const knex = require('knex');

const connection = knex(environmentConfig);

module.exports = connection;
