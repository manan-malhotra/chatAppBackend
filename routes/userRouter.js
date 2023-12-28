const express = require("express");
const {
    registerUser,
    loginUser,
    getProfile,
    logout,
    addContact,
} = require("../controller/userController");

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", getProfile);
router.get("/logout", logout);
router.post("/contacts", addContact);

module.exports = router;
