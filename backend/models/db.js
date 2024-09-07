const { Pool } = require('pg');


const pool = new Pool({
  user: 'circlepe_user',
  host: 'dpg-crcd5ebqf0us738jdc9g-a.singapore-postgres.render.com',
  database: 'circlepe',
  password: 'SP5pt1st9VrRIXebiRhy7wq4BdAHwgGE',
  port: 5432, 
  ssl: {
    rejectUnauthorized: false 
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
