import app from './src/app.js';
import config from './src/utils/global.config.js';
import connectDB from './src/database/mongodb.js';
import {defaultsCreate} from "./src/utils/auth.utils.js";

connectDB().then(() => {
    app.listen(config.SERVER.PORT, () => {
        console.log(`Server Port: ${config.SERVER.PORT}`)
    });
    defaultsCreate().then(() => {
        console.log("SysAdmin created successfully")
    }).catch(err => console.error('Error creating sysAdmin:', err))
})
.catch((error) => console.log(`${error} did not connect`));




