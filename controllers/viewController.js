const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const File = require("./../models/file");
const Folder = require("./../models/folder");
const Report = require("./../models/report");
const User = require("./../models/userModel");

// Run authController.protect middleware
// to redirects (not logged in) or set current user to req.user

const renderUser = async (req, res) => {
  var us = await User.findOne({ _id: new ObjectId(req.user.id) });
  var files = await File.find({
    userId: new ObjectId(req.user.id),
    folderId: null,
    isDele: false,
  });
  // console.log(files)
  var folders = await Folder.find({
    userId: new ObjectId(req.user.id),
    parent: null,
    isDele: false,
  });
  // console.log(folders)
  res.cookie("user", us.email);
  res.cookie("user_id", us._id);
  res.render("index", { us, files, folders });
};

const renderAdmin = async (req, res) => {
  const users = await User.find();
  let countUser = 0,
    countAdmin = 0;
  users.forEach((curr) => {
    curr.role === "user" ? countUser++ : countAdmin++;
  });
  const countReport = await Report.estimatedDocumentCount();
  res.status(200).render("indexAdmin", {
    title: "Management",
    countUser,
    countAdmin,
    countReport,
  });
};

exports.getOverview = async (req, res) => {
  if (req.user.role === "user") {
    await renderUser(req, res);
  } else if (req.user.role === "admin") {
    await renderAdmin(req, res);
  }
  // res.render('index', { title: 'Express' });
};

exports.getAllUsersView = async (req, res) => {
  res.status(200).render("userList.hbs", { title: "Manage Users" });
};

exports.getAllReportsView = async (req, res) => {
  res.status(200).render("adminReport.hbs", { title: "Manage Reports" });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render("register.hbs", { title: "Log into your account" });
};

exports.getForgotPasswordForm = (req, res) => {
  res
    .status(200)
    .render("forgotPassword.hbs", { title: "Retrieve your password" });
};

exports.getResetPasswordForm = (req, res) => {
  res.status(200).render("resetPW.hbs", {
    title: "Reset your password",
    token: req.query.token,
  });
};
