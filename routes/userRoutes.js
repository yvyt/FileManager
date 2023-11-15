var express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

var router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/", authController.resetPassword);

// Apply protect middleware to all below
router.use(authController.protect);

router.patch("/updatePassword", authController.updatePassword);

router.get("/me", userController.getMe, userController.getUser);

// User CRUD API
// Apply restrict to admin to all below
router.use(authController.restrict("admin"));

router.get("/", userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// router.get("/forgotPassword", function (req, res, next) {
//   res.render("forgotPassword.hbs");
// });
// router.get("/Register", function (req, res, next) {
//   res.render("register.hbs");
// });

module.exports = router;
