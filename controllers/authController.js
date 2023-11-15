const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("./../models/userModel");
const sendEmail = require("./../utils/email");

const tokenKey = "secret-token";

const signToken = (id) => {
  return jwt.sign({ id }, tokenKey, {
    expiresIn: "1d",
  });
};

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 1 * 1000 * 60 * 60 * 24),
    httpOnly: true,
  });

  // user.password = undefined;
  res.status(statusCode).redirect("/");
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    let errMsg;
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      errMsg = "Email already exists!";
    }
    if (err.name === "ValidationError") {
      const randomErr = Object.values(err.errors)[0];
      errMsg = randomErr.message;
    }
    res.status(400).json({
      status: "error",
      msg: errMsg,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email }).select("+password");
    // Check email and password
    if (!user || !(password === user.password)) {
      // return res.status(401).json({
      //   status: "error",
      //   msg: "Invalid email or password",
      // });
      return res
        .status(401)
        .render("Register", { msg: "Invalid email or password" });
    }
    // Send jwt if user information is valid
    sendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err,
    });
  }
};

exports.logout = async (req, res, next) => {
  res.clearCookie("jwt");
  res.clearCookie("user");
  res.clearCookie("user_id");
  res.redirect("/login");
};

exports.checkLogin = async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) return next();
  // Verify token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, tokenKey);
    res.redirect("/");
  } catch (err) {
    next();
  }
};

exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.redirect("/login");
  }

  // Verify token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, tokenKey);
  } catch (err) {
    return res.redirect("/login");
  }

  // Grant access to logged in user
  try {
    req.user = await User.findById(decoded.id);
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err,
    });
  }
  next();
};

exports.restrict = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(400).json({
        status: "error",
        message: "You don't have permission to perform this action",
      });
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // Get user from the input email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      status: "error",
      msg: "No user with this email address",
    });
  }

  // Generate reset token
  const resetToken = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  // Send token to mail
  const resetURL = `http://127.0.0.1:3000/resetPassword?token=${resetToken}`;

  const message = `Forgot your password? Create your new password at ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token (valid for 5 minutes)",
      message,
    });
    return res.status(200).json({
      status: "success",
      msg: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      status: "error",
      msg: "Server could not send email, try again later",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  // Get user with the token from URL and check if token has expired
  const user = await User.findOne({
    passwordResetToken: req.query.token,
    resetTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      status: "error",
      msg: "Reset token invalid",
    });
  }

  try {
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    console.log("error");
    let errMsg;
    if (err.name === "ValidationError") {
      const randomErr = Object.values(err.errors)[0];
      errMsg = randomErr.message;
    }
    res.status(400).json({
      status: "error",
      msg: errMsg,
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  // Get user with input password
  const user = await User.findOne({ password: req.body.passwordCurrent });

  if (!user) {
    return res.status(400).json({
      status: "error",
      msg: "Current password incorrect",
    });
  }

  // If the current password is correct, update password
  try {
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    res.status(200).json({
      status: "success",
      msg: "Password changed successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      msg: err,
    });
  }
};
