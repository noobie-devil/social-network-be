import multer from "multer";
import sharp from "sharp";
import ffmpeg from 'fluent-ffmpeg'
import * as path from "path";
import { fileURLToPath} from "url";
import * as fs from "fs";
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import {UnsupportedFileFormatError} from "../core/errors/unsupportedFileFormat.error.js";

const ffmpegPath = ffmpegInstaller.path
ffmpeg.setFfmpegPath(ffmpegPath);

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);
const allowedImageTypes = ['image/jpg', 'image/png', 'image/jpeg'];

const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/uploadedResources"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        let extension = null
        if(allowedImageTypes.includes(file.mimetype)) {
            extension = ".jpeg"
        } else if(file.originalname.match(/\.(mp4|avi|mkv)$/)) {
            extension = ".mp4"
        }
        cb(null, file.fieldname + "-" + uniqueSuffix + extension);
    }
})

const multerFilter = (req, file, cb) => {
    console.log(file)
    console.log(req)
    if(allowedImageTypes.includes(file.mimetype) || file.originalname.match(/\.(mp4|avi|mkv)$/)) {
        cb(null, true)
    } else {
        console.log('unsupported file')
        cb(new UnsupportedFileFormatError(), false)
    }
}

export const uploadAttachments = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limit: {fieldSize: 2000000}
})

const checkFileSize = async(filePath) => {
    const stats = fs.statSync(filePath)
    const fileSizeInBytes = stats.size
    console.log(`File size: ${fileSizeInBytes} bytes`);
}

export const imageResize = async(req, res, next) => {
    if(!req.files) return next();
    await Promise.all(
        req.files.images.map(async (file) => {
            if(allowedImageTypes.includes(file.mimetype)) {
                await checkFileSize(file.path)
                await sharp(file.path).resize(500, 500).toFormat('jpeg').jpeg({
                    quality: 90
                }).toFile(path.join(__dirname, `../public/uploadedResources/images/${file.filename}`))
                file.path = path.join(__dirname, `../public/uploadedResources/images/${file.filename}`)
                fs.unlinkSync(path.join(__dirname, `../public/uploadedResources/${file.filename}`));
            }
        })
    );
    next();
}


export const videoCompression = async(req, res, next) => {
    if(!req.files) return next()
    console.log("video compression: ")
    console.log(req.files.videos)
    await Promise.all(
        req.files.videos.map(async (file) => {
            if(file.originalname.match(/\.(mp4|avi|mkv)$/)) {
                console.log(`Checking input file sizes in bytes`)
                await checkFileSize(file.path)
                console.log(file)
                const ffmpegProcess = ffmpeg()
                    .input(file.path)
                    .output(`${file.destination}/videos/${file.filename}`)
                    .videoCodec('libx264')
                    .audioCodec('aac')
                    .videoBitrate(`1k`)
                    .autopad()
                const { code, signal } = await new Promise((resolve, reject) => {
                    ffmpegProcess.on("end", async function () {
                        console.log(`Video compression with file ${file.path} completed`);
                        console.log(`Checking output filesize in bytes`);
                        await checkFileSize(`${file.destination}/videos/${file.filename}`);
                        // Remove the original file after compression
                        // await fs.unlinkSync(`${file.destination}/videos/${file.filename}`);
                        resolve({ code: 0, signal: null });
                    });

                    ffmpegProcess.on("error", function (err) {
                        console.error("Error during ffmpeg processing:", err);
                        reject({ code: 1, signal: err });
                    });

                    console.log("Starting ffmpeg process");
                    ffmpegProcess.run();
                });

                if (code === 0) {
                    console.log("ffmpeg process completed successfully");
                } else {
                    console.error(`ffmpeg process failed with code ${code} and signal ${signal}`);
                }
            }
        })
    )
    next()
}
