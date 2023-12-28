const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// @desc    Registers users
// @route   POST /users/register
// @access  Public

const registerUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!password || !username) {
        res.status(400).json({ message: "Please enter all details!" });
    }
    const userFound = await User.findOne({ username });
    if (userFound) {
        res.status(400).json({ message: "Username already present." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userCreated = await User.create({
        username,
        password: hashedPassword,
    });
    const token = generateToken(userCreated);
    res.cookie("token", token, { sameSite: "none", secure: true })
        .status(201)
        .json({
            id: userCreated._id,
            username: userCreated.username,
        });
});

// @desc    Logs in users
// @route   POST /users/login
// @access  Public

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!password || !username) {
        res.status(400).json({ message: "Please enter all details!" });
    }
    const userFound = await User.findOne({ username });
    if (!userFound) {
        res.status(400).json({ message: "User not present." });
    }
    const match = await bcrypt.compare(password, userFound.password);
    if (!match) {
        res.status(400).json({ message: "Incorrect password." });
    }

    console.log(userFound.password);
    const token = generateToken(userFound);
    res.cookie("token", token, { sameSite: "none", secure: true })
        .status(200)
        .json({
            id: userFound._id,
            username: userFound.username,
            contacts: userFound.contacts,
        });
});

const getProfile = asyncHandler(async (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: "Not authorized." });
    } else {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.id);
        res.status(200).json({
            id: user._id,
            username: user.username,
            contacts: user.contacts,
        });
    }
});

const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token")
        .status(200)
        .json({ message: "Logged out successfully." });
});

const addContact = asyncHandler(async (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: "Not authorized." });
    } else {
        console.log(req.body);
        const user = jwt.verify(token, process.env.SECRET_KEY);
        const myUser = await User.findById(user.id);
        if (!myUser) {
            res.status(400).json({ message: "Credentials not present." });
            return;
        }

        const username = req.body?.username;
        if (!username) {
            res.status(400).json({ message: "Please enter all details!" });
            return;
        }
        let contact = await User.findOne({ username }, { _id: 1, username: 1 });
        if (!contact) {
            res.status(400).json({ message: "User not present." });
            return;
        }
        if (myUser.username == username) {
            console.log("Cannot add yourself.");
            res.status(400).json({ message: "Cannot add yourself." });
            return;
        }
        const contactsStored = myUser.contacts;
        let alreadyPresent = false;
        for (let i = 0; i < contactsStored.length; i++) {
            if (contactsStored[i].username === contact.username) {
                alreadyPresent = true;
                break;
            }
        }
        if (alreadyPresent) {
            console.log("Already added.");
            res.status(400).json({ message: "Already added." });
            return;
        }
        contact.unread = 0;
        myUser.contacts.push(contact);
        await myUser.save();
        res.status(200).json({
            message: "Contact added successfully.",
            contacts: myUser.contacts,
        });
    }
});

const generateToken = ({ _id, username }) => {
    return jwt.sign({ id: _id, username }, process.env.SECRET_KEY, {
        expiresIn: "30d",
    });
};

module.exports = { registerUser, loginUser, getProfile, logout, addContact };
