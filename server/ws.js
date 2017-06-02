const IO = require('socket.io');
const sjcl = require('sjcl');
const rs = require('randomstring');
const jsfs = require('jsonfile');
const path = require('path');

const { MongoDBService } = require('./dbmodule');

// Websocket usage of whole system
class WebSocket {
    init(server){
        this.io = new IO().listen(server);
        this.io.sockets.on('connection',function(socket){
            // when client side connection to our server
            // "Join" type
            socket.on("join",function(room_info){
                console.log('[Sync] Websocket open from: ' + socket.request.connection.remoteAddress+" ; With Room ID :" + room_info.room_name);
                // generate an random key to the user
                socket.emit('getKey',rs.generate());
            });
            // "Disconnect" type
            socket.on("disconnect",function(){
                console.log('[Sync] '+ socket.request.connection.remoteAddress +' ,detach from channel.' )
            });
            // "login"
            socket.on("login",function(userObj){
                // decode by userObj.key
                let uname = sjcl.decrypt(userObj.key,userObj.username);
                let upass = sjcl.decrypt(userObj.key,userObj.passwd);;
                // FIXME: using database to store instead json file

                jsfs.readFile(path.join(__dirname,'static','user','profile.json'),(err,data) => {
                    if(err)
                        console.log("Read user profile error!");
                    else{
                        let flag = 1;
                        for(var index in data.profile){
                            if(data.profile[index].username == uname && data.profile[index].passwd == upass){
                                // Emit successful msg back to user
                                socket.emit('login',{
                                    type: 'accept',
                                    user: uname,
                                    key: userObj.key
                                });
                                return;
                            }
                        }
                        // not match
                        socket.emit('login',{
                            type: 'error',
                            msg: 'Not found this user, you can use \'sign up\' to use our service!'
                        });
                    }
                })
            });
            // "signup"
            socket.on("signup",function(userObj){
                // decode by userObj.key
                let uname = sjcl.decrypt(userObj.key,userObj.username);
                let upass = sjcl.decrypt(userObj.key,userObj.passwd);;
                // FIXME: using database to store instead json file
                jsfs.readFile(path.join(__dirname,'static','user','profile.json'),(err,data) => {
                    if(err)
                        console.log("Read user profile error!");
                    else{
                        let flag = 1;
                        for(var index in data.profile){
                            if(data.profile[index].username == uname){
                                // This account has been enroll
                                socket.emit('login',{
                                    type: 'error',
                                    msg: 'This account has been used, try another one!'
                                })
                                return;
                            }
                        }
                        // user obj
                        var obj = {
                            username: uname,
                            passwd: upass
                        };
                        data.profile.push(obj);
                        // FIXME: Write into database
                        jsfs.writeFile(path.join(__dirname,'static','user','profile.json'),data,{spaces: 2},(err) => {
                            if(err){
                                // not match -> Enroll success
                                socket.emit('login',{
                                    type: 'error',
                                    msg: 'Internal Server Error, please contact server maintainer!'
                                });
                            }
                            else{
                                // not match -> Enroll success
                                socket.emit('login',{
                                    type: 'accept',
                                    user: uname,
                                    key: userObj.key
                                });
                            }
                        }); // write file back to profile
                    }
                }); // read from profile.json
            }); // signup listening
            // "donate"
            socket.on("donate",function(donation){
                jsfs.readFile(path.join(__dirname,'static','department',donation.dep+'.json'), (err,data)=>{
                    if(donation.currency == data.donate.currency){
                        // don't need to change
                        data.donate.current += donation.dollar;
                        if(data.donate.current > data.donate.target){
                            // FIXME : mail the maintainer !
                            console.log("Reach the target!");
                        }
                        jsfs.writeFileSync(path.join(__dirname,'static','department',donation.dep+'.json'),data,{spaces: 4});
                        // update donation contribution table
                        MongoDBService.article_donate(donation.dep,donation.lecturer,donation.dollar,donation.currency, (err,msg) => {
                            if(err)
                                console.log(msg);
                            else {
                                console.log(msg);
                                MongoDBService.donate_m.find({dep:donation.dep}).sort('-donation').exec(function(err,array){
                                    // rearrange array
                                    var rearrange = [ ['From which lecturer','accumulate donation'] ];
                                    for(var index in array){
                                        var new_obj = [ array[index].lecturer,array[index].donation ];
                                        rearrange.push(new_obj);
                                    }
                                    // emit update message
                                    socket.emit('update',{
                                        current: data.donate.current,
                                        target: data.donate.target,
                                        currency: data.donate.currency,
                                        sorted_contribution: rearrange
                                    });
                                });
                            }
                        });
                    }
                    else{
                        // TODO: different value
                    }
                }); // read department json
            }); // donation service
            // "click"
            socket.on("click",function(click_event){
                MongoDBService.article_click(click_event.dep,click_event.lecturer,click_event.title, (err,msg) => {
                    if(err)
                        console.log(msg);
                    else {
                        console.log(msg);
                    }
                })
            });

        }); // sockets connection listening
    }
}

module.exports = {
    WebSocket : new WebSocket()
}
