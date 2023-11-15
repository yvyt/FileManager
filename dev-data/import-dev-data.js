const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./../models/userModel");
const Report = require("./../models/report");
const File = require("./../models/file");
const Folder = require("./../models/folder");
// CONNECT TO DATABASE
mongoose.connect("mongodb://127.0.0.1:27017/FileManager", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var db = mongoose.connection;
db.on("error", () => console.log("error in connecting database"));
db.on("open", () => console.log("Connected to Database"));

// READ JSON FILE
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/users.json"), "utf-8")
);
const files = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/files.json"), "utf-8")
);
const reports = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/reports.json"), "utf-8")
);
const folders = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/folders.json"), "utf-8")
);
// IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await User.create(users);
    const user = await User.findOne({ email: "admin@gmail.com" });
    user.email = "admin";
    await user.save({ validateBeforeSave: false });

    await Report.create(reports);
    await File.create(files);
    await Folder.create(folders);
    console.log("Data successfully loaded");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DATABASE
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Report.deleteMany();
    await File.deleteMany();
    await Folder.deleteMany();
    console.log("Data successfully deleted");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// RUN SCRIPT TO IMPORT AND DELETE DATA

// npm run data:import
if (process.argv[2] === "--import") {
  importData();
  // npm run data:delete
} else if (process.argv[2] === "--delete") {
  deleteData();
}
