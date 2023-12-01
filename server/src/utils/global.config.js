import { config } from 'dotenv';

config();

const getEnvVariable = (key) => {
    const value = process.env[key];
    if(!value) {
        throw new Error(`ENVIRONMENT VARIABLE '${key}' NOT SPECIFIED.`);
    }
    return value;
};

export default {
    SERVER: {
        PORT: +getEnvVariable('PORT'),
        MORGAN_STYLE: getEnvVariable('SERVER_MORGAN_STYLE'),
        FIRST_SEGMENT_URL: getEnvVariable('FIRST_BASE_SEGMENT_URL')
    },
    MONGODB: {
        URL: getEnvVariable('MONGO_URL'),
    },
    BCRYPT: {
        SALT: +getEnvVariable("BCRYPT_SALT")
    },
    MAILER: {
        CLIENT_ID: getEnvVariable('MAILER_CLIENT_ID'),
        CLIENT_SECRET: getEnvVariable('MAILER_CLIENT_SECRET'),
        REFRESH_TOKEN: getEnvVariable('MAILER_REFRESH_TOKEN'),
        ADDRESS: getEnvVariable('MAILER_ADDRESS')
    },
    FIREBASE: {
        API_KEY: getEnvVariable('FB_API_KEY'),
        AUTH_DOMAIN: getEnvVariable('FB_AUTH_DOMAIN'),
        PROJECT_ID: getEnvVariable('FB_PROJECT_ID'),
        STORAGE_BUCKET: getEnvVariable('FB_STORAGE_BUCKET'),
        MESSAGING_SENDER_ID: getEnvVariable('FB_MESSAGING_SENDER_ID'),
        APP_ID: getEnvVariable('FB_APP_ID'),
        MEASUREMENT_ID: getEnvVariable('FB_MEASUREMENT_ID')
    }
}
