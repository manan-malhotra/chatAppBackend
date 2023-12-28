const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: [true, "Please enter username"],
        },
        password: {
            type: String,
            required: [true, "Please enter password"],
        },
        contacts: {
            type: Array,
        },
        unread: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
