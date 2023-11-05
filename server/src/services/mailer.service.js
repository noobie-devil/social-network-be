import nodemailer from 'nodemailer'
import globalConfig from "../utils/global.config.js";
import {OAuth2Client} from "google-auth-library"


let authClient
const initOAuth2Client = () => {
    authClient = new OAuth2Client(
        globalConfig.MAILER.CLIENT_ID,
        globalConfig.MAILER.CLIENT_SECRET
    )
    authClient.setCredentials({
        refresh_token: globalConfig.MAILER.REFRESH_TOKEN,
        scope: "https://mail.google.com"
    })
}

const refreshHandler = async () => {
    try {
        const tokenResponse = await authClient.refreshToken(globalConfig.MAILER.REFRESH_TOKEN)
        const accessToken = tokenResponse.tokens.access_token

        authClient.setCredentials({
            access_token: accessToken,
            refresh_token: globalConfig.MAILER.REFRESH_TOKEN
        })
        return accessToken
    } catch (error) {
        console.error('Error refreshing access token:', error.message)
        throw error
    }
}

const getAccessToken = async() => {
    if(!authClient) {
        initOAuth2Client()
    }
    const {credentials} = authClient
    if (!authClient.credentials.refresh_token) {
        throw new Error('Missing refresh token. Please provide a callback refresh handler.');
    }
    if(!credentials.access_token || credentials.expiry_date < Date.now()) {
        return await refreshHandler()
    } else {
        return credentials.access_token
    }
}



const transporter = nodemailer.createTransport({
    service: 'gmail',

})
