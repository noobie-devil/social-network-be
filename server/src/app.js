import express from "express";
import bodyParser from "body-parser";
import * as fs from "fs";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import config from './utils/global.config.js';
import { notFound, errorHandler } from './middlewares/index.js';
import router from './routes/index.js';
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'UTeSocial API Document',
            version: '1.0.0',
            description: '',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [
            {
                bearerAuth: [],
            }
        ],
        servers: [
            {
                url: 'http://localhost:3001/'
            }
        ],
    },
    apis: [`${__dirname}/swagger.js`]

}



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
const specs = swaggerJSDoc(options)

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
    .use(config.SERVER.FIRST_SEGMENT_URL, router)
    .use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))
    // .use('/api-doc', swaggerUi.serve, swaggerUi.setup(specs))
    .use(notFound)
    .use(errorHandler)

// checkOverload()
export default app;
