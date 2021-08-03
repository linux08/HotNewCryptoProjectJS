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
        return new Promise(async (res,rej) => {
            try {
                let vm = this
                let user = await this.getFriends(user_id, count)
                const allFriends = []
                for(let i = 0 ; i < user.users.length; i++ ) {
                    let userFriends = await this.getFriends(user.users[i], i)
                    allFriends.push({
                        user: user.users[i],
                        friends: userFriends.users
                    })
                }
                res(allFriends)
     
            } catch(e) {
                rej(e)
            }
            
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