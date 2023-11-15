const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const fileSchema = mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  folderId: {
    type: Schema.Types.ObjectId,
    ref: "Folder",
    require: true,
  },
  size: {
    type: Number,
    required: true,
  },
  isImage: {
    type: Boolean,
    required: false,
  },
  isDele: {
    type: Boolean,
    default: false,
  },
  isShare: {
    type: Boolean,
    default: false,
  },
  isImportant: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    require: true,
  },
  modify: { type: Date },
});
const File = mongoose.model("File", fileSchema);
module.exports = File;
