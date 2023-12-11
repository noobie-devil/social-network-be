import {firebaseStorageDelete, firebaseStorageDeleteAndRef, firebaseStorageUpload} from "./firebaseStorage.service.js";
import ResourceStorage, {ResourceType} from "../models/resourceStorage.model.js";
import {NotFoundError} from "../core/errors/notFound.error.js";
import {BadRequestError} from "../core/errors/badRequest.error.js";


const deleteAssetResource = async({resources}) => {
    const deleter = async ({url}) => firebaseStorageDelete(url)
    const resourceStorages = await ResourceStorage.find({
        _id: { $in: resources}
    })
        .select('url')
    for(const resourceStorage of resourceStorages) {
        await deleter(resourceStorage)
    }
}

const deleteAssetResourceWithRef = async({resources}) => {
    const deleter = async ({_id, url}) => firebaseStorageDeleteAndRef(_id, url)
    const resourceStorages = await ResourceStorage.find({
        _id: { $in: resources}
    })
        .select('url')
    for(const resourceStorage of resourceStorages) {
        await deleter(resourceStorage)
    }
}

const uploader = async (file) => firebaseStorageUpload(file)

const updateSingleAssetResource = async({files, assetId}) => {
    let assetUpdate = await ResourceStorage.findById(assetId)
    if(!assetUpdate) throw new NotFoundError()
    const deleter = async ({deleteUrl}) => firebaseStorageDelete(deleteUrl)

    for(const key in files) {
        if(Object.hasOwnProperty.call(files, key)) {
            const fileArray = files[key]
            if(fileArray && fileArray.length !== 0) {
                const file = fileArray[0]
                const resourceType = key === 'images' ? ResourceType.IMAGE : ResourceType.VIDEO
                if(resourceType !== assetUpdate.resourceType) {
                    throw new BadRequestError()
                }
                const deleteUrl = assetUpdate.url
                const {url} = await uploader(file)
                assetUpdate.url = url
                assetUpdate = await assetUpdate.save({new: true})
                // no need to wait
                deleter({deleteUrl})
                return assetUpdate
            }
        }
    }
}

const uploadAssetResource = async(req) => {
    const uploader = async (file) => firebaseStorageUpload(file)
    const files = req?.files
    const resources = []
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
    uploadAssetResource,
    updateSingleAssetResource,
    deleteAssetResource,
    deleteAssetResourceWithRef
}
