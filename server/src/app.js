import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import config from './utils/global_config.js';
import connectDB from "./database/mongodb.js";
import { notFound, errorHandler } from './middlewares/index.js';
import router from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });


const app = express();
app
    .use(bodyParser.json())
    .use(helmet())
    .use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
    .use(helmet.hidePoweredBy())
    .use(helmet.permittedCrossDomainPolicies())
    .use(morgan(config.SERVER.MORGAN_STYLE))
    .use(cors())
    .use("/assets", express.static(path.join(__dirname, 'public/assets')))
    .use('/api/v1', router)
    .use(notFound)
    .use(errorHandler);

connectDB().then(() => {
    app.listen(config.SERVER.PORT, () => console.log(`Server Port: ${config.SERVER.PORT}`));
})
.catch((error) => console.log(`${error} did not connect`));

export default app;
