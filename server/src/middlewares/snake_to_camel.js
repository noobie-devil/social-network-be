import { camelCase} from "change-case";

const convertToCamelCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => convertToCamelCase(item));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((result, key) => {
            result[camelCase(key)] = convertToCamelCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
}

export const snakeToCamelCase = (req, res, next) => {
    if (req.body) {
        req.body = convertToCamelCase(req.body);
    }
    next();
}
