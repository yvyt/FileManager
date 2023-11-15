const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const shareSchema = mongoose.Schema({
    userShare: {
        type: Schema.Types.ObjectId,
        ref: "users",
        require: true
    },
    userReceive: {
        type: String,
        require: true
    },
    fileId: {
        type: Schema.Types.ObjectId,
        ref: "file",
        require: true
    },
    type: {
        type: Number,
        default: 0
    },
    keyShare: {
        type: String,
        require: true
    },
    modify: { type: Date }
})
const Share = mongoose.model("Share", shareSchema)
module.exports = Share