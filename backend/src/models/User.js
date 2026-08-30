const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },

    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password:{
        type: String,
        required: true,
        minlength: 6
    },

    profilePicture:{
        type: String,
        default: "/default/default-profile.png"
    },

    inOnline: {
        type: Boolean,
        default: false,
    },

    lastSeen:{
        type: Date,
        default: null
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;