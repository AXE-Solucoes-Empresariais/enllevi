export const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'loginsql',
    database: 'enllevi',
  },
});
