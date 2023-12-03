import app from './src/app.js';
import config from './src/utils/global.config.js';
import connectDB from './src/database/mongodb.js';
import {defaultsCreate} from "./src/utils/auth.utils.js";
import {initializeApp} from 'firebase/app'
import { getAnalytics,isSupported } from "firebase/analytics"

// const firebaseConfig = {
//     apiKey: config.FIREBASE.API_KEY,
//     authDomain: config.FIREBASE.AUTH_DOMAIN,
//     projectId: config.FIREBASE.PROJECT_ID,
//     storageBucket: config.FIREBASE.STORAGE_BUCKET,
//     messagingSenderId: config.FIREBASE.MESSAGING_SENDER_ID,
//     appId: config.FIREBASE.APP_ID,
//     measurementId: config.FIREBASE.MEASUREMENT_ID,
// }
// const firebaseApp = initializeApp(firebaseConfig)
// const analytics = isSupported().then(yes => yes ? getAnalytics(firebaseApp) : null)

connectDB().then(() => {
    app.listen(config.SERVER.PORT, () => {
        console.log(`Server Port: ${config.SERVER.PORT}`)
    });
    defaultsCreate().then(() => {
        console.log("SysAdmin created successfully")
    }).catch(err => console.error('Error creating sysAdmin:', err))
})
.catch((error) => console.log(`${error} did not connect`));




