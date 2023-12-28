const ws = require("ws");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Message = require("../models/messageModel");
let wss;
const connectSocket = (server) => {
    wss = new ws.WebSocketServer({ server });

    wss.on("connection", handleConnection);
};

const handleConnection = (connection, req) => {
    const notifyOnline = () => {
        console.log([...wss.clients].map((c) => c.username));
        [...wss.clients].forEach((client) => {
            client.send(
                JSON.stringify({
                    online: [...wss.clients].map((c) => ({
                        userId: c.userId,
                        username: c.username,
                    })),
                })
            );
        });
    };
    const cookie = req?.headers?.cookie;
    if (cookie) {
        console.log("COOKIES FOUND");
        const tokenStr = cookie
            .split(";")
            .find((str) => str.startsWith("token="));
        const token = tokenStr.split("=")[1];
        const user = jwt.verify(token, process.env.SECRET_KEY);
        connection.userId = user.id;
        connection.username = user.username;
    }
    console.log("test " + connection.username);
    connection.on("message", async (text) => {
        const data = JSON.parse(text);
        console.log("Message from " + connection.username + " " + text);
        const message = data?.message;
        const selectedContact = data?.selectedContact;
        const messageDoc = await Message.create({
            message,
            sender: connection.userId,
            recipient: selectedContact,
        });
        // connection.send("manan");
        // const dataToSend = {
        //     id: messageDoc._id,
        //     message,
        //     sender: connection.userId,
        //     recipient: selectedContact,
        // };
        const dataToSend = messageDoc;
        let user = await User.findById(selectedContact);
        let userContact = user?.contacts;
        userContact.forEach((c) => {
            if (c._id == connection.userId) {
                c.unread += 1;
            }
        });
        user.markModified("contacts");
        await user.save();
        const client = [...wss.clients];
        client.forEach((c) => {
            if (c.userId === selectedContact) {
                console.log("sending " + c.username);
                c.send(JSON.stringify(dataToSend));
                return;
            }
        });
    });
    // notifyOnline();
};

module.exports = { connectSocket };
