const twitterClient = require('../api/twitter')
const async = require("async")


class Twitter {

    async getFriends(user_id, count) {
        return new Promise((res,rej)=>{
            twitterClient.get('friends/list', {user_id,count}, function(err, data, response) {
                if(err) rej(err)
                return res(data)
            })
        })
    }

    async getFriendsOfUser(user_id, count) {
        return new Promise((res,rej) => {
            let vm = this
            this.getFriends(user_id, count).then((user) => {
                let allFriends = []
                async.forEach(user.users, (currentUser,cb) => {
                    vm.getFriends(currentUser, 50).then((res)=>{
                        allFriends.push({
                            user: currentUser,
                            friends: res.users
                        })
                        // setTimeout(()=>{},4000)
                        cb()
                    })
                    .catch(err=>{
                        cb(err)
                    })
    
                },(err)=>{
                    if(err) return rej(err)
                    res(allFriends)
                })
            })
            .catch((err)=>{
                rej(err)
            })
            
        })
    }

    async getFriendsList(user_id, count, next) {
        return new Promise((res,rej)=>{
            twitterClient.get('users/lookup', {count, user_id}, function(err, data, response) {
                if(err) rej(err)
                return res(data)
            })
        })
    }


}

module.exports = Twitter