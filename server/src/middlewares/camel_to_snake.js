import { snakeCase } from "change-case";


const convertToSnakeCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => convertToSnakeCase(item));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((result, key) => {
            result[snakeCase(key)] = convertToSnakeCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
}

export const camelToSnakeCase = (req, res, next) => {
    const { response } = req;
    if(response) {
        if(response.body) {
            response.body = JSON.parse(JSON.stringify(response.body).replace(/([A-Z])/g, '_$1').toLowerCase());
        }
        res.status(response.status).json(response.body);
    } else {
        next();
    }
    // const originalSend = res.send;
    // res.send = (data) => {
    //     if (data && data.constructor.name === 'Object') {
    //         data = convertToSnakeCase(data);
    //     }
    //     res.send = originalSend;
    //     res.send(data);
    // };
    // next();
}
