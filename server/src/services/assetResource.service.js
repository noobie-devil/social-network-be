import {firebaseStorageUpload} from "./firebaseStorage.service.js";

const uploadAssetResource = async(req) => {
    const uploader = async (file) => firebaseStorageUpload(file)
    const urls = []
    const files = req?.files

    for(const key in files) {
        if(Object.hasOwnProperty.call(files, key)) {
            const fileArray = files[key]
            for(const file of fileArray) {
                const {url} = await uploader(file)
                urls.push(url)
            }
        }
    }
    return urls
}

export {
    uploadAssetResource
}
