import {firebaseStorageUpload} from "./firebaseStorage.service.js";
import ResourceStorage, {ResourceType} from "../models/resourceStorage.model.js";

const uploadAssetResource = async(req) => {
    const uploader = async (file) => firebaseStorageUpload(file)
    const files = req?.files
    const resources = [];
    for(const key in files) {
        if(Object.hasOwnProperty.call(files, key)) {
            const fileArray = files[key]
            for(const file of fileArray) {
                const {url} = await uploader(file)
                const resourceType = key === 'images' ? ResourceType.IMAGE : ResourceType.VIDEO
                const resource = new ResourceStorage({
                    url, resourceType
                })
                await resource.save()
                resources.push(resource)
            }
        }
    }
    return { resources }
}

export {
    uploadAssetResource
}
