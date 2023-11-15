var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var viewRouter = require("./routes/viewRoutes.js");
var userRouter = require("./routes/userRoutes.js");
var reportRouter = require("./routes/reportRoutes.js");
var users = require("./routes/users.js");
var cors = require("cors");
const User = require("./models/userModel.js");
const hbs = require("hbs");
const Admin = require("./routes/adminRoute.js")
var app = express();
app.use(cors());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
hbs.registerHelper("truncateString", function(str) {
    if (str.length > 15) {
        return str.substring(0, 12) + "...";
    } else {
        return str;
    }
});
hbs.registerHelper("roleOfUser", function(userRole, expectedRole) {
    return userRole === expectedRole;
});

app.use("/", users);
app.use("/api/users", userRouter);
app.use("/api/reports", reportRouter);
app.use("/admin", Admin);

// app.use("/user", users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// // error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

mongoose.connect("mongodb://127.0.0.1:27017/FileManager", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

var db = mongoose.connection;
db.on("error", () => console.log("error in connecting database"));
db.on("open", () => console.log("Connected to Database"));

module.exports = app;