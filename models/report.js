const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const reportSchema = mongoose.Schema({
  userReport: {
    type: Schema.Types.ObjectId,
    ref: "users",
    require: true,
  },
  fileId: {
    type: Schema.Types.ObjectId,
    ref: "File",
    require: true,
  },
  type: {
    type: Number,
    require,
  },
  solution: {
    type: Number,
  },
  modify: { type: Date },
});

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
