import app from './src/app.js';
import config from './src/utils/global_config.js';
import connectDB from './src/database/mongodb.js';

connectDB().then(() => {
    app.listen(config.SERVER.PORT, () => console.log(`Server Port: ${config.SERVER.PORT}`));
})
.catch((error) => console.log(`${error} did not connect`));
