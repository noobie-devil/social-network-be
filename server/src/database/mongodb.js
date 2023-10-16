import mongoose from "mongoose";
import config from '../utils/global_config.js';
import {removeVersionFieldPlugin} from "./plugins.js";

const PORT = config.PORT;
mongoose.set('strictQuery', true);
mongoose.set('toJSON', {
    transform: function(doc, ret) {
        delete ret.__v;
    }
});
mongoose.set('toObject', {
    transform: function(doc, ret) {
        delete ret.__v;
    }
});


const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log('Connected to MongoDb');
    });
    await mongoose.connect(config.MONGODB.URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
    });
}

export default connectDB;
