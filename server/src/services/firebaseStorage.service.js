import config from "../utils/global.config.js";
import {initializeApp} from "firebase/app";
import {getAnalytics, isSupported} from "firebase/analytics";
import {getDownloadURL, getStorage, ref, uploadBytesResumable, deleteObject} from "firebase/storage";
import {UnsupportedFileFormatError} from "../core/errors/unsupportedFileFormat.error.js";
import {readFileSync} from "fs";
import ResourceStorage from "../models/resourceStorage.model.js";
import mongoose from "mongoose";

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


const firebaseStorageDeleteAndRef = async(_id, url) => {
    const storageRef = ref(storage, url)
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        await ResourceStorage.findByIdAndDelete(_id, {session})
        await deleteObject(storageRef)
        await session.commitTransaction()
        console.log('Delete success ' + url)
    } catch (e) {
        if(e.code) {
            switch(e.code) {
                case 'storage/object-not-found':
                    console.log(`firebaseStorageDeleteAndRef catch error: ${url} not exists`)
                    break;
            }
        } else {
            console.error(`firebaseStorageDeleteAndRef catch error: ${e}`)
            await session.abortTransaction()
        }
    } finally {
        await session.endSession()
    }
}
const firebaseStorageDelete = async(deleteUrl) => {
    console.log(deleteUrl)
    const storageRef = ref(storage, deleteUrl)
    try {
        await deleteObject(storageRef)
        console.log('Delete success ' + deleteUrl)
    } catch (e) {
        if(e.code) {
            switch(e.code) {
                case 'storage/object-not-found':
                    console.log(`firebaseStorageDelete catch error: ${url} not exists`)
                    break;
            }
        } else {
            console.error(`firebaseStorageDelete catch error: ${e}`)
        }
    }
}

const firebaseStorageUpload = async(fileToUpload) => {
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
    firebaseStorageUpload,
    firebaseStorageDelete,
    firebaseStorageDeleteAndRef
}
