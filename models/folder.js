const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const folderSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        require: true
    },
    name: {
        type: String,
        require: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: "Folder",
        require: true
    },
    path: {
        type: String,
        require: true
    },
    isDele: {
        type: Boolean,
        default: false
    },
    isImportant: {
        type: Boolean,
        default: false
    },
    modify: { type: Date }

})
const Folder = mongoose.model("Folder", folderSchema)
module.exports = Folder