const { ObjectId } = require("mongodb");
const File = require("./../models/file");
const Folder = require("./../models/folder");
const Report = require("./../models/report");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");

var express = require("express");
var router = express.Router();
router.get("/userPermission", async(req, res) => {
    var token = req.cookies.jwt
    if (token != null) {
        var idUser = jwt.decode(token)
        var us = await User.findOne({ _id: new ObjectId(idUser.id) })
        var files = await File.find({
            userId: new ObjectId(idUser.id),
            folderId: null,
            isDele: false,
        });
        // console.log(files)
        var folders = await Folder.find({
            userId: new ObjectId(idUser.id),
            parent: null,
            isDele: false,
        });
        // console.log(folders)
        res.cookie("user", us.email);
        res.cookie("user_id", us._id);
        res.render("index", { us, files, folders });
    }
})
module.exports = router;