import express from "express";
import bodyParser from "body-parser";
import * as fs from "fs";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { parse } from "jest-docblock";
import DocBlock from "docblock";
import { fileURLToPath } from "url";
import config from './utils/global_config.js';
import { notFound, errorHandler } from './middlewares/index.js';
import router from './routes/index.js';
import compression from "compression";
import {checkOverload} from "./helpers/check.connect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerFile = fs.readFileSync(__dirname + '/swagger.js').toString();
const swaggerDoc = new DocBlock().parse(swaggerFile, 'js');
// console.log(swaggerDoc);

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'UnBlocial API Document',
            version: '1.0.0',
            description: '',
        },
        severs: [
            {
                api: 'http://localhost:3001/'
            }
        ]
    },
    apis: ['./routes/auth.js'],
};


// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, "public/assets");
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.originalname);
//     }
// });
//
// const upload = multer({ storage });

// const specs = swaggerJSDoc(options);

const app = express();
app
    .use(bodyParser.json())
    .use(helmet())
    .use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
    .use(helmet.hidePoweredBy())
    .use(helmet.noSniff())
    .use(helmet.permittedCrossDomainPolicies())
    .use(morgan(config.SERVER.MORGAN_STYLE))
    .use(compression())
    .use(cors())
    .use("/assets", express.static(path.join(__dirname, 'public/assets')))
    .use('/api/v1', router)
    // .use('/api-doc', swaggerUi.serve, swaggerUi.setup(specs))
    .use(notFound)
    .use(errorHandler);
checkOverload()
export default app;
