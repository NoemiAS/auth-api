module.exports = {
  app: {
    configName: 'production',
    host: 'localhost',
    port: 3000,
    endpoint: 'http://localhost:3000',
    url: 'http://localhost:4200'
  },
  database: {
    host: 'pg.dev....co',
    port: '5432',
    database: '',
    username: '',
    password: '',
    dialect: 'postgres',
    logging: false
  },
  jwt: {
    secretKey: 'P#/fO;Tl"z\fHdFhtMLz3!E&[]a3fx3Fq4hPcpL0s!GmM3kh4H1=l'
  }
};