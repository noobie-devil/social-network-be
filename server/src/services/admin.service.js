import {createAdminSchema} from "../schemaValidate/admin.schema.js"
import * as adminRepo from "../repositories/admin.repo.js"
import {sendMail} from "./mailer.service.js";
const create = async(req) => {
    await createAdminSchema.validateAsync(req.body)
    const admin = await adminRepo.create(req.body)
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

export {
    create
}
