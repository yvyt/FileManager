const bodyParse = require("body-parser");
const mongoose = require("mongoose");

var express = require("express");
var router = express.Router();
// const app = express()

router.use(bodyParse.json());
router.use(express.static("public"));
router.use(
  bodyParse.urlencoded({
    extended: true,
  })
);

//connect database

mongoose.connect("mongodb://127.0.0.1:27017/FileManager", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var db = mongoose.connection;
db.on("error", () => console.log("error in connecting database"));
db.on("open", () => console.log("Connected to Database"));

//data upload
/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.render("index.hbs");
});

module.exports = router;
