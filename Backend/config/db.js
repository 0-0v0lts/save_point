const mysql = require('mysql2');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('não conectou no sql:', err);
        return;
    }
    console.log('conectou ao sql');
});

module.exports = connection;