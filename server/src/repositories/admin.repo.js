import {Admin} from "../models/admin.model.js";


const create = async(payload) => {
    return Admin.create(payload)
}


export {
    create
}
