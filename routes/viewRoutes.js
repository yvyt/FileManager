// var express = require("express");
// const jwt = require('jsonwebtoken');
// const { ObjectId } = require('mongodb');
// const User = require("./../models/userModel");
// const Folder = require('./../models/folder')

// const viewController = require("./../controllers/viewController");

// var router = express.Router();

// router.get("/", viewController.getOverview);
// router.get("/login", viewController.getLoginForm);
// router.get("/logout", (req, res) => {
//     res.clearCookie("jwt")
//     res.clearCookie('user')
//     res.clearCookie('user_id')
//     res.redirect("/login")
// })

// router.get("/buyStorage", async(req, res) => {
//     var token = req.cookies.jwt
//     if (token != null) {
//         var idUser = jwt.decode(token)
//         var us = await User.findOne({ _id: new ObjectId(idUser.id) })
//         res.render("buyStorage", { us })
//     } else {
//         res.redirect("/login")
//     }
// });

// router.get("/upload", async(req, res) => {
//     var token = req.cookies.jwt
//     if (token != null) {
//         var idUser = jwt.decode(token)
//         var us = await User.findOne({ _id: new ObjectId(idUser.id) })
//         var folders = await Folder.find({ userId: new ObjectId(idUser.id) })

//         res.render("upload", { us, folders })
//     } else {
//         res.redirect("/login")
//     }
// });

// router.get("/shareFile", (req, res) => {
//     res.render('shareFile.hbs');
// });

// module.exports = router;