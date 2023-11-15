let express = require("express");
const reportController = require("./../controllers/reportController");
const authController = require("./../controllers/authController");

var router = express.Router();

router.get("/", reportController.getAllReports);
router.post("/sendWarning/:id", reportController.sendWarning);

router.route("/:id").delete(reportController.deleteReport);

module.exports = router;
