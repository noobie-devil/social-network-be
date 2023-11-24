import globalConfig from "../utils/global.config.js";
import {asyncHandler} from "../core/utils/core.utils.js";
import * as permissionService from "../services/permission.service.js";
import {InvalidCredentialsError} from "../core/errors/invalidCredentials.error.js";
import {ForbiddenError} from "../core/errors/forbidden.error.js";


export const permissionMiddleware = asyncHandler(async (req, res, next) => {
    console.log(`permissionMiddleware:request:${req}`)
    if(req.user && req.isAdmin && req.isAdmin === true) {
        if(req.user.type === 'sysAdmin') {
            console.log("This is sysAdmin")
            return next()
        }
    }
    const endPointResource = getEndpointResource(req)
    console.log(`permissionMiddleware:endPointResource:${endPointResource}`)
    const existingResource = await permissionService.findPermissionByResourceName(endPointResource)
    if(existingResource) {
        console.log(`permissionMiddleware:existingResource`)
        const currentMethod = req.method
        console.log(`permissionMiddleware:currentMethod:${currentMethod}`)
        let allowedOperations = operations[existingResource.othersPermission]
        if(allowedOperations && allowedOperations.includes(currentMethod)) {
            console.log(`permissionMiddleware:allowedWithOthersPermission`)
            return next()
        }
        if(!req.user) {
            throw new InvalidCredentialsError()
        }
        if(req['isAdmin'] && req['isAdmin'] === true) {
            console.log(`permissionMiddleware:isAdmin`)
            const aid = req.user._id
            const gid = req.user.group
            const hasPermission = await permissionService.checkAdminHasPermission(aid, gid, existingResource._id)
            console.log(`permissionMiddleware:admin:hasPermission:${hasPermission}`)
            if(hasPermission) {
                console.log(hasPermission.operation)
                allowedOperations = operations[hasPermission.operation]
                if(operations && allowedOperations.includes(currentMethod)) {
                    console.log(`permissionMiddleware:admin:hasPermissionWithOperation`)
                    return next()
                }
            }
        }
        throw new ForbiddenError()
    }
    return next()
})

const operations = {
    1: ["PUT", "DELETE"],
    2: ["POST"],
    3: ["POST", "PUT", "DELETE"],
    4: ["GET"],
    5: ["PUT", "DELETE", "GET"],
    6: ["GET", "POST"],
    7: ["GET", "POST", "PUT", "DELETE"]
}

const getEndpointResource = (req) => {
    let {baseUrl} = req
    console.log(baseUrl)
    baseUrl = baseUrl.replace(globalConfig.SERVER.FIRST_SEGMENT_URL, "")
    console.log(baseUrl)
    // console.log(req.route.path)
    console.log(req.path)
    let path = ""
    if(req.route && req.route.path) {
        const routes = req.route.path.split('/')
        for(const i in routes) {
            if(routes[i].startsWith(':')) {
                break
            } else {
                path = routes[i]
            }
        }
    }
    console.log(path)
    if(path === "") {
        return baseUrl
    }
    return `${baseUrl}/${path}`
}
