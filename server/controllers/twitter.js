const twitterClient = require('../api/twitter')
const async = require("async")
const User = require("../models/user")

class Twitter {

    getFriends(user_id, count) {
        return new Promise((res,rej)=>{
            twitterClient.get('friends/list', {user_id,count}, function(err, data, response) {
                if(err) rej(err)
                return res(data)
            })
        })
    }

    getFriendsOfUser(user_id, count) {
        return new Promise((res,rej) => {
            let vm = this
            this.getFriends(user_id, count).then((user) => {
                let allFriends = []
                async.forEach(user.users, (currentUser,cb) => {
                    vm.getFriends(currentUser.id_str, 50).then((resp)=>{
                        allFriends.push({
                            user: currentUser,
                            friends: resp.users
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

    getFriendsList(user_id, next) {
        return new Promise((res,rej)=>{
            twitterClient.get('users/lookup', {user_id}, function(err, data, response) {
                if(err) rej(err)
                return res(data)
            })
        })
    }



    /////// get current friends of user 
    ///////// loop through each friend
    /////////// if new friend, save in db
    //////////// if old friend next step (update details)
    ///////////// get all current friend of user (save in db with created at)

    async performFriendsUpdate(user_id, count, next) {
        try {
            let vm = this
            let user = await this.getFriends(user_id, count)
            let allFriends = []
            async.forEach(user.users, async (currentUser,cb) => {
                let dbUser = await User.find({id_stry:currentUser.id_str}).exec()
                console.log(dbUser)
                let currentFriend, following
                following = await this.getFriends(currentUser.id_str, 50)
                let newids = following.users.map((el) => el.id_str)
                if(!dbUser.length) {
                    let newUser = {...currentUser,friends:newids,isFriend:true,newFriends:true}
                    currentFriend =  await User.create(newUser)

                }else {
                    let oldids = {}, newFriends = false
                    for(let i=0; i<dbUser.friends.length; i++) {
                        if(!oldids[dbUser.friends[i]]) {
                            oldids[dbUser.friends[i]] = true
                        }
                    }
                    for(let i=0; i<newids.length; i++) {
                        if(!oldids[newids[i]]) {
                            newFriends = true
                        }
                    }
                    let allids = [...newids, ...dbUser.friends]
                    currentFriend = await User.findOneAndUpdate({id_str:currentUser.id_str}, {screen_name:currentUser.screen_name, friends:allids}, {new:true})
                    
                }

            },(err)=>{
                if(err) return next(err)
                return allFriends
            })
                
        }catch(e) {
            next(e)
        }
    }

    async getPageData() {
        const Users = await User.find({})
        let sendUsers = []
        for(let i=0; i<Users.length; i++) {
            const friends = await this.getFriendsList(Users[i].friends)
            let update = {...Users[i]._doc, friends_info: friends}
            sendUsers.push(update)               
        }
        return sendUsers
       
        
    }



}

module.exports = Twitter