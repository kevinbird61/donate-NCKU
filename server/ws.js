const IO = require('socket.io');
const sjcl = require('sjcl');
const rs = require('randomstring');
const jsfs = require('jsonfile');
const path = require('path');

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
                            type: 'error'
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
                        jsfs.writeFile(path.join(__dirname,'static','user','profile.json'),data.profile,{spaces: 2},(err) => {
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
        }); // sockets connection listening
    }
}

module.exports = {
    WebSocket : new WebSocket()
}
