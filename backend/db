const knex = require("knex");
const { Pool } = require("pg");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL || `postgresql://${process.env.dbuser}:${process.env.dbpassword}@${process.env.dbhost}:${process.env.dbport}/${process.env.dbname}`;

// Knex setup
const db = knex({
  client: "pg",
  connection: {
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  },
});

// PostgreSQL Pool setup
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

module.exports = { db, pool };
