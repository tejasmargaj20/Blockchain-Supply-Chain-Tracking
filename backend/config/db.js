const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "tejas246m",
    database: "blockchain_supply_chain_db"
});

db.connect((error) => {

    if (error) {
        console.error("MySQL connection failed:");
        console.error(error.message);
        return;
    }

    console.log("MySQL connected successfully");

});

module.exports = db;