import _ from "lodash";

export const omitFields = ({ fields = [], obj = {} }) => {
    return _.pick(obj, fields)
}
