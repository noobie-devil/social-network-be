import _ from "lodash";

export const omitFields = ({ fields = [], obj = {} }) => {
    return _.pick(obj, fields)
}

export const cleanData = (obj) => {
    return _.omitBy(obj, v => v == null)
}

export const cleanNullAndEmptyData = (obj) => {
    return _.omitBy(obj, v => v == null || v === '' || v === undefined)
}

export const getSelectObjFromSelectArr = (selectArr) => {
    return Object.fromEntries(selectArr.map(it => [it, 1]))
}

export const getUnSelectObjFromSelectArr = (selectArr) => {
    return Object.fromEntries(selectArr.map(it => [it, 0]))
}

export const parseNestedObj = (obj) => {
    const res = {}
    Object.entries(obj).forEach(([k, v]) => {
        if(typeof v === 'object' && !Array.isArray(v)) {
            Object.entries(parseNestedObj(v)).forEach(([k2, v2]) => {
                res[`${k}.${k2}`] = v2
            })
        } else {
            res[k] = v
        }
    })
    return res
}
