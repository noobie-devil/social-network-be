export const longTimestampsPlugin = function(schema, options) {
    schema.add({
        createdAt: {
            type: Number,
            default: Date.now,
            set: dateToNumber,
        },
        updatedAt: {
            type: Number,
            default: Date.now,
            set: dateToNumber,
        },
    });


}

export const removeVersionFieldPlugin = function(schema, options) {
    schema.pre('find', function (next) {
        this.select('-__v')
        next()
    })
    schema.pre('findOne', function (next) {
        this.select('-__v')
        next()
    })
}

function dateToNumber(date) {
    return new Date(date).getTime();
}
