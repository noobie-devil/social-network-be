import admin from 'firebase-admin'
import {getMessaging} from "firebase-admin/messaging"
import * as serviceAccount from '../../socialappstorage-firebase-adminsdk-92d7e-f97a8e9d95.json'

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const messaging = getMessaging()

const sendToUserId = async(req) => {

}
