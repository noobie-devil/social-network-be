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
    }
}