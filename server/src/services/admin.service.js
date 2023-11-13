import {createAdminGroupSchema, createAdminSchema, updateAdminToGroup} from "../schemaValidate/admin.schema.js"
import * as adminRepo from "../repositories/admin.repo.js"
import {sendMail} from "./mailer.service.js";
import {validateMongodbId} from "../utils/global.utils.js";
const createAdmin = async(req) => {
    await createAdminSchema.validateAsync(req.body)
    const admin = await adminRepo.createAdmin(req.body)
    let mailPayload = {}
    mailPayload.title = "Registered Successfully"
    mailPayload.subject = "Registered Successfully"
    mailPayload.to = admin.email
    mailPayload.body = `<p style="margin: 0; margin-bottom: 16px;">You received a registered admin account:</p>
                        <p style="margin: 0; margin-bottom: 16px;">Username: ${req.body.email}</p>
                        <p style="margin: 0;">Password: ${req.body.password}</p>`
    sendMail(mailPayload)
    return admin
}

const createAdminGroup = async(req) => {
    await createAdminGroupSchema.validateAsync(req.body)
    return await adminRepo.createAdminGroup(req.body)
}

const addToGroup = async(req) => {
    const gid = req.params.groupdId
    validateMongodbId(gid)
    await updateAdminToGroup.validateAsync(req.body)
    return await adminRepo.addToGroup({aid: req.body.adminId, gid})
}

const removeFromGroup = async(req) => {
    const gid = req.params.groupId
    validateMongodbId(gid)
    await updateAdminToGroup.validateAsync(req.body)
    return await adminRepo.removeFromGroup({aid: req.body.adminId, gid})
}

export {
    createAdmin,
    createAdminGroup,
    addToGroup,
    removeFromGroup
}
