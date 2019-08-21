const { Client } = require('pg');
const config = require('./../../config').appConfig(process.env.NODE_ENV).database;

const connectionString = `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;

const client = new Client(connectionString);
client.connect();

module.exports = {
  client,
};

