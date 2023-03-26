import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from './routes/auth.js';
import errorHandler from './middlewares/ErrorHandler.js';

import {NotFoundError} from "./errors/NotFoundError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
app.use(bodyParser.json());
// app.use(express.json(express.urlencoded()));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(morgan("common"));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));

app.use("/auth", authRoutes);

app.use((req, res, next) => {
    const error = new NotFoundError();
    next(error);
})

app.use(errorHandler);

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

const PORT = process.env.PORT || 6001;
mongoose.set('strictQuery', true);
mongoose.set('toJSON', {
    transform: function(doc, ret) {
        delete ret.__v;
    }
});
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
})
.then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
})
.catch((error) => console.log(`${error} did not connect`));
