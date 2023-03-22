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
import { register } from './controllers/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
app.use(express.json(express.urlencoded()));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(morgan("common"));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));

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
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
})
.catch((error) => console.log(`${error} did not connect`));
