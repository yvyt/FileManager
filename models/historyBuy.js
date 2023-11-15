const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const historySchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        require: true
    },
    package: {
        type: Number,
        require: true,
        default: 0
    },
    price: {
        type: Number,
        require: true,
        default: 0
    },
    modify: { type: Date }
})
const history = mongoose.model("HistoryBuy", historySchema)
module.exports = history