const express = require("express");
const router = express.Router();
const {
    fetchMessages,
    clearMessages,
} = require("../controller/messageController");
require("dotenv").config();

router.get("/", fetchMessages);
router.get("/:selectedAccount", clearMessages);

module.exports = router;
