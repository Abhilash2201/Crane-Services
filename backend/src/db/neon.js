const { neon } = require("@neondatabase/serverless");
const env = require("../config/env");

const sql = neon(env.databaseUrl);

module.exports = { sql };
