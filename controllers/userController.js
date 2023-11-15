const {
  findByIdAndDelete,
  findById,
  findByIdAndUpdate,
} = require("../models/folder");
const User = require("./../models/userModel");
const APIFeatures = require("./../utils/apiFeatures");

exports.getAllUsers = async (req, res, next) => {
  try {
    let users;
    const { name } = req.query;
    const regex = new RegExp(name, "i");
    const searchContent = {
      name: regex,
      _id: { $ne: req.user.id },
    };
    users = User.find(searchContent);
    const estCount = await User.find(searchContent).countDocuments(); // SEND RESPONSE
    const features = new APIFeatures(users, req.query)
      // .filter()
      .paginate()
      .sort();
    users = await features.query;
    const limit = req.query.limit * 1 || 5;
    res.status(200).json({
      status: "success",
      totalPages: Math.ceil(estCount / limit),
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err,
    });
  }
};

exports.getMe = async (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = async (req, res, next) => {
  const user = await findByIdAndUpdate(req.user.id, req.body, {
    runValidators: true,
    new: true,
  });
  return res.status(200).json({ status: "success", data: { user } });
};

// exports.updateUser = async (req, res, next) => {};
exports.getUser = async (req, res, next) => {
  try {
    const user = await findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "No user found with that ID" });
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    return res.status(400).json({ status: "error", message: err });
  }
};

exports.deleteUser = async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: "success" });
};
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "No user found with that ID" });
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    return res.status(400).json({ status: "error", message: err });
  }
};
