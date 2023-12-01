import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import {UnsupportedFileFormatError} from "../core/errors/unsupportedFileFormat.error.js";
import config from "../utils/global.config.js";
import {initializeApp} from "firebase/app";
import {getAnalytics, isSupported} from "firebase/analytics"
import {readFileSync} from 'fs'

const firebaseConfig = {
    apiKey: config.FIREBASE.API_KEY,
    authDomain: config.FIREBASE.AUTH_DOMAIN,
    projectId: config.FIREBASE.PROJECT_ID,
    storageBucket: config.FIREBASE.STORAGE_BUCKET,
    messagingSenderId: config.FIREBASE.MESSAGING_SENDER_ID,
    appId: config.FIREBASE.APP_ID,
    measurementId: config.FIREBASE.MEASUREMENT_ID,
}
const firebaseApp = initializeApp(firebaseConfig)
const analytics = isSupported().then(yes => yes ? getAnalytics(firebaseApp) : null)

const storage = getStorage()
const uploadAssetResource = async(req) => {
    const uploader = (file) => firebaseStorageUpload(file)
    const urls = []
    let files = req?.files?.images
    for(const file of files) {
        const {path} = file
        const newPath = await uploader(file)
        urls.push(newPath)
    }
    // files = req?.files?.videos
    // for(const file of files) {
    //     const {path} = file
    //     const newPath = await uploader(file)
    //     urls.push(newPath)
    // }
    return urls
}

const firebaseStorageUpload = async(fileToUpload) => {
    console.log(fileToUpload.mimetype)
    console.log(fileToUpload.originalname)
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpeg'];
    let storageRef = null
    let metadata = null
    if(allowedImageTypes.includes(fileToUpload.mimetype)) {
        storageRef = ref(storage, 'images/' + fileToUpload.filename)
        metadata = {
            contentType: 'image/jpeg'
        }
    } else if(fileToUpload.originalname.match(/\.(mp4|avi|mkv)$/)) {
        storageRef = ref(storage, 'videos/' + fileToUpload.filename)
        metadata = {
            contentType: 'video/mp4'
        }
    } else {
        throw new UnsupportedFileFormatError()
    }
    const fileBuffer = readFileSync(fileToUpload.path);
    const uploadTask = uploadBytesResumable(storageRef, fileBuffer, metadata)
    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }

            },
            (error) => {
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        console.log('User doesn\'t have permission to access the object\n')
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        console.log('User canceled the upload')
                        break;

                    // ...

                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        console.log('Unknown error occurred, inspect error.serverResponse')
                        break;

                }
                reject(error)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    resolve({
                        url: downloadURL
                    })
                }).catch(reason => {
                    console.error('Error getting download URL:', reason)
                    reject(reason)
                })

            })
    })
}

export {
    uploadAssetResource
}
