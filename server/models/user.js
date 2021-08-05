const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    screen_name: String,
    id_str: String,
    isFriend: { type: Boolean, default: false },
    friends: Array,
    newFriends: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema)

module.exports = User