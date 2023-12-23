import {
    changeAdminPasswordSchema,
    changeAdminUsernameSchema,
    createAdminGroupSchema,
    createAdminSchema, queryAdminSchema, updateAdminGroupSchema, updateAdminSchema,
    updateAdminToGroupSchema
} from "../schemaValidate/admin.schema.js"
import * as adminRepo from "../repositories/admin.repo.js"
import {sendMail} from "./mailer.service.js";
import {validateMongodbId} from "../utils/global.utils.js";
import {baseQuerySchema} from "../schemaValidate/query.schema.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";


const getAdmin = async(req) => {
    await queryAdminSchema.validateAsync(req.query)
    return await adminRepo.getAdmin(req.query)
}

const createAdmin = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await createAdminSchema.validateAsync(req.body)
    req.body.createdBy = req.user._id
    req.body.updatedBy = req.user._id
    const admin = await adminRepo.createAdmin(req.body)
    let mailPayload = {}
    mailPayload.title = "Registered Successfully"
    mailPayload.subject = "Registered Successfully"
    mailPayload.to = admin.email
    mailPayload.body = `<p style="margin: 0; margin-bottom: 16px;">You received a registered admin account:</p>
                        <p style="margin: 0; margin-bottom: 16px;">Username: ${req.body.email}</p>
                        <p style="margin: 0;">Password: ${req.body.password}</p>`
    try {
        sendMail(mailPayload)
    } catch (e) {
        console.log(e)
    }
    return admin
}

const updateAdmin = async (req) => {
    const aid = req.params.adminId
    validateMongodbId(aid)
    await updateAdminSchema.validateAsync(req.body)
    return await adminRepo.updateAdmin(req.body, aid)
}

const changeAdminUsername = async(req) => {
    const aid = req.params.adminId
    validateMongodbId(aid)
    await changeAdminUsernameSchema.validateAsync(req.body)
    return await adminRepo.changeUsername(req.body, aid)
}

const changeAdminPassword = async(req) => {
    const aid = req.params.adminId
    validateMongodbId(aid)
    await changeAdminPasswordSchema.validateAsync(req.body)
    return await adminRepo.changePassword(req.body, aid)
}

const deleteAdmin = async(req) => {
    const aid = req.params.adminId
    validateMongodbId(aid)
    return await adminRepo.deleteAdmin(aid)
}

const getAdminGroup = async(req) => {
    await baseQuerySchema.validateAsync(req.query)
    return await adminRepo.getAdminGroup(req.query)
}
const createAdminGroup = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    await createAdminGroupSchema.validateAsync(req.body)
    req.body.updatedBy = req.user._id
    req.body.createdBy = req.user._id
    return await adminRepo.createAdminGroup(req.body)
}

const updateAdminGroup = async(req) => {
    const gid = req.params.groupId
    validateMongodbId(gid)
    await updateAdminGroupSchema.validateAsync(req.body)
    return await adminRepo.updateAdminGroup(gid, req.body)
}

const deleteAdminGroup = async(req) => {
    const gid = req.params.groupId
    validateMongodbId(gid)
    return await adminRepo.deleteAdminGroup(gid)
}

const addToGroup = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    const gid = req.params.groupId
    validateMongodbId(gid)
    await updateAdminToGroupSchema.validateAsync(req.body)
    const updatedBy = req.user._id
    return await adminRepo.addToGroup({aid: req.body.adminId, gid, updatedBy})
}

const removeFromGroup = async(req) => {
    if(!req.user) throw new InvalidCredentialsError()
    const gid = req.params.groupId
    validateMongodbId(gid)
    await updateAdminToGroupSchema.validateAsync(req.body)
    const updatedBy = req.user._id
    return await adminRepo.removeFromGroup({aid: req.body.adminId, gid, updatedBy})
}

export {
    createAdmin,
    getAdmin,
    updateAdmin,
    changeAdminPassword,
    changeAdminUsername,
    deleteAdmin,
    getAdminGroup,
    createAdminGroup,
    updateAdminGroup,
    deleteAdminGroup,
    addToGroup,
    removeFromGroup,
}
