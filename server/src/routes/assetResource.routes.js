import express from "express";
import {imageResize, uploadAttachments} from "../middlewares/uploadImages.middleware.js";
import {uploadAssetResource} from "../controllers/assetResource.controller.js";


const assetResourceRouter = express.Router()

assetResourceRouter.post('/upload', uploadAttachments.fields([
    { name: 'images', maxCount: 30},
    { name: 'videos', maxCount: 10}
]), imageResize, uploadAssetResource)

export default assetResourceRouter
