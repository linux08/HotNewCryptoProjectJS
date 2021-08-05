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

    getFriendsList(user_id, count, next) {
        return new Promise((res,rej)=>{
            twitterClient.get('users/lookup', {count, user_id}, function(err, data, response) {
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

    performFriendsUpdate(user_id, count) {
        return new Promise(async (res,rej) => {
           try {
            let vm = this
            let user = await this.getFriends(user_id, count)
            let allFriends = []
            for(let i=0; i <user.users.length; i++) {
                let currentUser = user.users[i]
                let dbUser = await User.find({id_str:currentUser.id_str}).exec()
                let currentFriend, following
                following = await this.getFriends(currentUser.id_str, 50)
                let newids = following.users.map((el) => el.id_str)
                if(!dbUser.length) {
                    let newUser = {...currentUser,friends:newids,isFriend:true,newFriends:false}
                    currentFriend =  await User.create(newUser)
                    // console.log(currentFriend)
                    allFriends.push(currentFriend)

                }else {
                    let oldids = {}, newFriends = false
                    if(dbUser[0].friends) {
                        console.log('theres friends')
                        for(let i=0; i<dbUser[0].friends.length; i++) {
                                oldids[dbUser[0].friends[i].id_str] = true
                        }
                        for(let i=0; i<newids.length; i++) {
                            if(!oldids[newids[i]]) {
                                newFriends = true
                            }
                        }
                        newids = [...newids, ...dbUser[0].friends]
                    }
                    currentFriend = await User.findOneAndUpdate({id_str:currentUser.id_str}, {screen_name:currentUser.screen_name, friends:newids, newFriends}, {new:true})
                    // console.log( 'new follow', newFriends)
                    allFriends.push(currentFriend)
                    
                }

            }
            res(allFriends)
           }catch(e) {
               rej(e)
           }
        })
    }

    async getPageData() {
        const Users = await User.find({})
        let sendUsers = []
        for(let i=0; i<Users.length; i++) {
            const friends = await this.getFriendsList(Users[i].friends)
            let update = {...Users[i]._doc, friends_info: friends}
            sendUsers.push(update)               
        }
        //  for(let i=0; i<Users.length; i++) {
        //     await User.findByIdAndDelete({_id:Users[i].id})
                        
        // }
        return sendUsers
       
        
    }



}

module.exports = Twitter