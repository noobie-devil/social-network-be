import app from './src/app.js';
import config from './src/utils/global.config.js';
import connectDB from './src/database/mongodb.js';
import {defaultsCreate, deleteUser} from "./src/utils/auth.utils.js";

const PORT = process.env.PORT || config.SERVER.PORT

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server Port: ${PORT}`)
    });
    defaultsCreate().then(() => {
        console.log("SysAdmin created successfully")
    }).catch(err => console.error('Error creating sysAdmin:', err))
})
.catch((error) => console.log(`${error} did not connect`));




