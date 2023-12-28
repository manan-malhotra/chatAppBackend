const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const fetchMessages = asyncHandler(async (req, res) => {
    const token = req.cookies?.token;
    if (!token) res.status(401).json({ message: "Unauthorized" });
    const { id, username } = jwt.verify(token, process.env.SECRET_KEY);
    if (!id) res.status(401).json({ message: "Unauthorized" });
    const data = await Message.find({
        $or: [{ sender: id }, { recipient: id }],
    });
    console.log(data);
    res.json({ messages: data });
});

const clearMessages = asyncHandler(async (req, res) => {
    const token = req.cookies?.token;
    if (!token) res.status(401).json({ message: "Unauthorized" });
    const { id, username } = jwt.verify(token, process.env.SECRET_KEY);
    if (!id) res.status(401).json({ message: "Unauthorized" });
    const { selectedAccount } = req.params;
    console.log(selectedAccount);
    const user = await User.findById(id);
    if (!user) res.status(401).json({ message: "Unauthorized" });
    let userContact = user?.contacts;
    userContact.forEach((c) => {
        if (c._id == selectedAccount) {
            c.unread = 0;
        }
    });
    user.markModified("contacts");
    await user.save();
    console.log(user);
    res.json({
        message: "Contact added successfully.",
        contacts: user.contacts,
    });
});

module.exports = { fetchMessages, clearMessages };
