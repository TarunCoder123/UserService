require('dotenv').config();

export const env={
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
    ACCESS_TOKEN_EXPIRY:process.env.ACCESS_TOKEN_EXPIRY,
    PORT:process.env.PORT,
    DB_WRITE_HOST:process.env.DB_WRITE_HOST,
    DB_WRITE_PORT:process.env.DB_WRITE_PORT,
    DB_WRITE_NAME:process.env.DB_WRITE_NAME,
    DB_WRITE_USER:process.env.DB_WRITE_USER,
    DB_WRITE_PASS:process.env.DB_WRITE_PASS,

    DB_READ_HOST:process.env.DB_READ_HOST,
    DB_READ_NAME:process.env.DB_READ_NAME,
    DB_READ_PASS:process.env.DB_READ_PASS,
    DB_READ_PORT:process.env.DB_READ_PORT,
    DB_READ_USER:process.env.DB_READ_USER,
    DB_SCHEMA:process.env.DB_SCHEMA,
    DB_CONNECTION_STRING:process.env.DB_CONNECTION_STRING
}