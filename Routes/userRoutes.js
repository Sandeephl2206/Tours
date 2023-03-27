const express = require("express");
const router = express.Router();
const userController = require("../Controller/userController")
const authController = require("../Controller/authcontroller")
router.post("/signup",authController.registerUser)
router.post("/login",authController.login)

router.route("/")
.get(userController.GetAllUsers)
.post(userController.createNewUsers)

router.route("/:id")
.get(userController.getUsersById)
.patch(userController.updateUsers)
.delete(userController.deleteUsers)

module.exports = router;