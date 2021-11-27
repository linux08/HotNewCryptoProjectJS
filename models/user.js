const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        screen_name: String,
        id_str: String,
        isFriend: { type: Boolean, default: false },
        friends: Array,
        newFriends: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "created_at",updatedAt: "updated_at" }}
);

const User = mongoose.model('User', UserSchema)

module.exports = User