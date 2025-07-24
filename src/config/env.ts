require('dotenv').config();

export const env={
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "15m",
    ACCESS_TOKEN_EXPIRY:process.env.ACCESS_TOKEN_EXPIRY || "7d",
    PORT:process.env.PORT,
    DB_WRITE_HOST:process.env.DB_WRITE_HOST,
    DB_WRITE_PORT:process.env.DB_WRITE_PORT,
    DB_WRITE_NAME:process.env.DB_WRITE_NAME,
    DB_WRITE_USER:process.env.DB_WRITE_USER,
    DB_WRITE_PASS:process.env.DB_WRITE_PASS,

    REDIS_HOST:process.env.REDIS_HOST,
    REDIS_PORT:process.env.REDIS_PORT,
    REDIS_URL:process.env.REDIS_URL,
    
    DB_READ_HOST:process.env.DB_READ_HOST,
    DB_READ_NAME:process.env.DB_READ_NAME,
    DB_READ_PASS:process.env.DB_READ_PASS,
    DB_READ_PORT:process.env.DB_READ_PORT,
    DB_READ_USER:process.env.DB_READ_USER,
    DB_SCHEMA:process.env.DB_SCHEMA,
    DB_CONNECTION_STRING:process.env.DB_CONNECTION_STRING,

    API_KEY_OTP: process.env.FAST2SMS_API_KEY,
    API_ENDPOINT: process.env.FAST2SMS_END_POINT || "",
}