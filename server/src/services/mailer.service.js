import nodemailer from 'nodemailer'
import globalConfig from "../utils/global.config.js";
import {OAuth2Client} from "google-auth-library"
import path from "path";
import hbs from 'nodemailer-express-handlebars'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);


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

const handlebarOptions = {
    viewEngine: {
        extName: ".handlebars",
        partialsDir: path.resolve('./src/public/views'),
        defaultLayout: false
    },
    viewPath: path.resolve('./src/public/views'),
    extName: ".handlebars"
}


export const sendMail = async({to, subject, title, body}) => {
    const accessToken = await getAccessToken()
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: globalConfig.MAILER.ADDRESS,
            clientId: globalConfig.MAILER.CLIENT_ID,
            clientSecret: globalConfig.MAILER.CLIENT_SECRET,
            refresh_token: globalConfig.MAILER.REFRESH_TOKEN,
            accessToken: accessToken
        },
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
    })

    transporter.use('compile', hbs(handlebarOptions))
    const mailOptions = {
        from: 'utesocial.app',
        to: to,
        subject: subject,
        template: 'mail.template',
        attachments:[{
            filename: 'UTE_SOCIAL.png',
            path: path.resolve('./src/public/assets/images/UTE_SOCIAL.png'),
            cid: "logo"
        }, {
            filename: "Beefree-logo.png",
            path: path.resolve('./src/public/assets/images/Beefree-logo.png'),
            cid: "beefreeLogo"
        }
        ],
        context: {
            title: title,
            body: body
        }
    }
    transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
            console.log(error)
        } else {
            console.log(`Email sent: ${info.response}`)
        }
    })
}


