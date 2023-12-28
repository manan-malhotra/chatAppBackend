const cookieParser = require("cookie-parser");
const express = require("express");
const { errorHandler } = require("./middleware/errorMiddleware.js");
const connectDB = require("./config/db.js");
const cors = require("cors");
const { connectSocket } = require("./config/socket.js");
const app = express();
require("dotenv").config();

require("dotenv").config();
app.use(cookieParser());

connectDB();
app.use(
    cors({
        credentials: true,
        origin: process.env.CLIENT_URL,
        optionsSuccessStatus: 200,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);
app.use(express.json());
app.get("/", (req, res) => {
    console.log("first");
    res.send("Hello World!");
});

app.use("/users", require("./routes/userRouter.js"));
app.use("/messages", require("./routes/messageRouter.js"));

app.use(errorHandler);

const server = app.listen(3000, () => console.log("Listening on port 3000"));

connectSocket(server);
