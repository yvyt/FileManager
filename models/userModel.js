const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide your name!"],
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide valid email"],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        validate: {
            validator: function(el) {
                return el.length >= 6;
            },
            message: "Password must have at least 6 characters",
        },
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords are not the same!",
        },
    },
    usingSize: {
        type: Number,
        default: 0
    },
    maxSize: {
        type: Number,
        default: 1073741824
    },
    passwordResetToken: String,
    resetTokenExpiration: Date,
});

userSchema.pre("save", async function(next) {
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.createResetToken = function() {
    // Generate password reset token, n random characters
    const resetToken = crypto.randomBytes(10).toString("hex");
    this.passwordResetToken = resetToken;

    // Expires after 5minutes
    this.resetTokenExpiration = Date.now() + 1000 * 60 * 5;

    return resetToken;
};
const User = mongoose.model("User", userSchema);
module.exports = User;