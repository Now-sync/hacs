var crypto = require("crypto");
var fs = require("fs");
var https = require("https");
var express = require("express");
var bodyParser = require("body-parser");
var IO = require("socket.io");
var expressValidator = require("express-validator");

var app = express();

app.use(bodyParser.json());

var privateKey = fs.readFileSync( "server.key" );
var certificate = fs.readFileSync( "server.crt" );
var config = {
        key: privateKey,
        cert: certificate,
        NPNProtocols: ['http/2.0', 'spdy', 'http/1.1', 'http/1.0']
};

var server = https.createServer(config, app);
var io = IO(server);

var BLOCK_CONSOLE = process.env.NODE_ENV !== "test";

var PORT;
if (process.env.NODE_ENV === "test") {
    PORT = 3002;
} else {
    PORT = 3000;
}

/* -----------  -------------*/

var ROOM_NAME_LENGTH = 16;
var USERNAME_CHARACTER_LIMIT = 16;


/* -----------  -------------*/
var activeRooms = {};
var verifyRoomAndPassword = function (roomname, roompass, callback) {

    var found = false;
    for (var key in activeRooms) {
        if (key === roomname) {
            found = true;
            break;
        }
    }

    if (found) {
        var roomData = activeRooms[roomname];
        var hash = crypto.createHmac("sha512", roomData.salt);
        hash.update(roompass);
        var saltedHashPass = hash.digest("base64");
        if (roomData.saltedHashPass === saltedHashPass) {
            callback(null, roomData);
        } else {
            callback("Password Does Not match", null);
        }
    } else {
        callback("No such room", null);
    }
};

/* every 10 seconds look for and remove dead rooms. */
setInterval(function () {
    var key, currRoom;
    for (key in activeRooms) {
        currRoom = activeRooms[key];
        if (currRoom.activeUsers.length !== 0) {
            activeRooms[key].isDead = 6;
        } else if (currRoom.isDead <= 0) {
            delete activeRooms[key];
        } else {
            activeRooms[key].isDead--;
        }
    }
}, 10000);

var removeUser = function (roomname, username) {
    if (activeRooms) {
        var room = activeRooms[roomname];
        if (room && room.activeUsers) {
            var ind = room.activeUsers.indexOf(username);
            if (ind >= 0) room.activeUsers.splice(ind, 1);
        }
    }
};

var addUserToRoom = function (roomname, username, callback) {
    activeRooms[roomname].activeUsers.push(username);
    callback(null);
};

var addNewRoom = function (roomname, roompass, videoUrl, callback) {
    var salt = crypto.randomBytes(16).toString("base64");
    var hash = crypto.createHmac("sha512", salt);
    hash.update(roompass);

    var saltedHashPass = hash.digest("base64");

    activeRooms[roomname] = {
        salt: salt,
        saltedHashPass: saltedHashPass,
        activeUsers: [],
        videoUrl: videoUrl,
        isDead: 6
    };

    callback(null, activeRooms[roomname]);
};

var setRoomVideo = function (roomname, videoUrl, callback) {
    if (activeRooms[roomname]) {
        activeRooms[roomname].videoUrl = videoUrl;
    } else {
        callback("Error no such room");
    }
    callback(null);
};

var isRoom = function (roomname, callback) {
    if (activeRooms[roomname]) {
        callback(true);
    } else {
        callback(false);
    }
};

var isUsernameUnique = function (roomname, username, callback) {
    if (activeRooms[roomname].activeUsers.indexOf(username) < 0) {
        callback(true);
    } else {
        callback(false);
    }
};

/* -----------  -------------*/

var youtubeUrlValidator = function(url) {
    /* regex taken from
    http://stackoverflow.com/questions/28735459/how-to-validate-youtube-url-in-client-side-in-text-box */
    var regExp = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return url !== undefined && url !== "" ? regExp.test(url) : false;
};

app.use(function (req, res, next) {
    if (BLOCK_CONSOLE) console.log("HTTPS request", req.method, req.url, req.body);
    return next();
});

/* http://stackoverflow.com/questions/35408729/express-js-prevent-get-favicon-ico */
app.get("/favicon.ico/", function (req, res) {
    /* Remove this GET method if necessary.
    Only here to prevent favicon error console spam */
    res.status(200).end();
});

/* Sanitize and Validate */
app.use(expressValidator({
    customValidators: {
        fail: function(){
            return false;
        },
        validateVideoUrl: function(url){
            return youtubeUrlValidator(url);
        }
    }
}));

app.use(function(req, res, next){
    Object.keys(req.body).forEach(function(arg){
        switch(arg){
            case "roomPassword":
                req.sanitizeBody(arg).escape().trim();
                break;
            case "videoUrl":
                req.checkBody(arg, "invalid Url").validateVideoUrl().isURL();
                break;
            case "roomname":
                req.sanitizeBody(arg).escape().trim();
                break;
            case "password":
                break;
            default:
                req.checkBody(arg, "unknown argument").fail();
        }
    });
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) return res.status(400).send("Validation Error");
        else next();
    });
});

/* Create Room */
app.put("/api/createroom/", function (req, res, next) {
    var roomPassword = req.body.roomPassword;
    var videoUrl = req.body.videoUrl;
    if (!roomPassword) {
        res.status(400).end("No Room Password Given");
        return next();
    }

    var new_room_name = crypto.randomBytes(ROOM_NAME_LENGTH)
                        .toString("base64")
                        .replace(/\//g,"_")
                        .replace(/\+/g,"-")
                        .replace(/\=/g,"");

    /* Add new room to db and set room password HERE*/
    addNewRoom(new_room_name, roomPassword, videoUrl, function (err) {
        if (err) {
            res.status(500).end("Database Error");
            return next();
        }

        res.json({roomname: new_room_name});  // respond with roomname
        return next();
    });
});

app.get("/api/room/:room_id/", function (req, res) {
    var roomId = req.params.room_id;

    isRoom(roomId, function (roomExists) {
        if (roomExists) {
            res.status(200).end("Room exists");
        } else {
            res.status(404).end("404 no such room");
        }
    });
});


/* Sockets */

io.on("connection", function (client) {
    if (BLOCK_CONSOLE) console.log("NEW CONNECTION");

    var clientInRoom = null;
    var screenName = null;

    client.on("join", function (data) {
        if (BLOCK_CONSOLE) console.log("Socket signal join");
        var roomname = data.roomname;
        var roompass = data.roompass;
        var username = data.username;

        if (!roomname || !roompass) {
            client.emit("joinError", {roomname:roomname, roompass:roompass});
            return;
        }

        verifyRoomAndPassword(roomname, roompass, function (err, roomData) {
            if (err) {
                client.emit("joinError", {roomname:roomname, roompass:roompass});
                return;
            }

            /* This function is for readability. Simply used after username correction. */
            var _joinRoom = function () {
                if (clientInRoom && clientInRoom !== roomname) {  // If already in a room, leave it.
                    client.leave(clientInRoom, function () {
                        removeUser(clientInRoom, screenName);
                        io.to(clientInRoom).emit("userLeft", {username: screenName});
                        clientInRoom = null;
                    });
                }

                client.join(roomname, function (err) {
                    if (err) {
                        client.emit("joinError", {roomname:roomname, roompass:roompass});
                        return;
                    }
                    clientInRoom = roomname;
                    addUserToRoom(clientInRoom, screenName, function (err) {
                        if (err) {
                            /* Do something */
                            return;
                        }

                        client.emit("joinSuccess");
                        io.to(clientInRoom).emit("userJoined", {username: screenName});

                        /* When user has joined the room. Send the Url of the video in the room */
                        client.emit("videoChange", {
                            videoUrl: roomData.videoUrl,
                            username: null  // null because no user emitted videoChange signal
                        });
                    });

                });

            };  // END _joinRoom function

            if (!username) {  // If joining room without given username, random name is generated.
                screenName = "user_" + crypto.randomBytes(8).toString("base64");
                _joinRoom();
            } else {
                username = "" + username;  // Make sure username is string.
                if (username.length > USERNAME_CHARACTER_LIMIT) {
                    username = username.slice(0, USERNAME_CHARACTER_LIMIT);
                }

                isUsernameUnique(roomname, username, function (isUnique) {
                    if (isUnique) {
                        screenName = username;
                    } else {
                        screenName = username + "_" + crypto.randomBytes(6).toString("base64");
                    }
                    _joinRoom();
                });
            }
        });

    });

    client.on("requestVideoInfo", function() {

        /* Request current video time */
        io.in(clientInRoom).clients(function (err, clients) {
            if (clients) {
                client.broadcast.to(clients[0]).emit("requestTime");
            } // Client is room master. Do nothing.
        });
    });

    client.on("videoChange", function (data) {
        if (BLOCK_CONSOLE) console.log("Socket signal video change");

        if (clientInRoom && data) {
            setRoomVideo(clientInRoom, data.videoUrl, function() {
                io.to(clientInRoom).emit("videoChange", {
                    videoUrl: data.videoUrl,
                    username: screenName
                });
            });
        }
    });

    client.on("pause", function (data) {
        if (BLOCK_CONSOLE) console.log("Socket signal pause");
        if (!data) {
            if (BLOCK_CONSOLE) console.log("No pause data given.");
            return;
        }
        if (clientInRoom && data) {
            client.broadcast.to(clientInRoom).emit("pause", {pausedtime: data.pausedtime, username: screenName});
        }
    });

    client.on("play", function (data) {
        if (BLOCK_CONSOLE) console.log("Socket signal play");
        if (!data) {
            data = {};
        }
        data.username = screenName;
        if (clientInRoom) client.broadcast.to(clientInRoom).emit("play", data);
    });

    client.on("currentTime", function (data) {  // received response from client to requestTime
        if (BLOCK_CONSOLE) console.log("Socket signal currentTime");
        if (!data) {
            if (BLOCK_CONSOLE) console.log("No currentTime data given.");
            return;
        }
        if (clientInRoom && data) {
            io.to(clientInRoom).emit("skipTo", {skipToTime: data.currTime});
        }
    });

    client.on("skipTo", function (data) {
        if (BLOCK_CONSOLE) console.log("Socket signal skipTo");
        if (!data) {
            if (BLOCK_CONSOLE) console.log("No skipTo data given.");
            return;
        }
        if (clientInRoom && data) {
            io.to(clientInRoom).emit("skipTo", data);
        }
    });

    client.on("sendMessage", function (data) {
        if (BLOCK_CONSOLE) console.log("Socket signal sendMessage");
        if (!data) {
            if (BLOCK_CONSOLE) console.log("No sendMessage data given.");
            return;
        }
        if (clientInRoom && data) {
            data.username = screenName;
            data.timeStamp = new Date();
            client.broadcast.to(clientInRoom).emit("receivedMessage", data);
        }
    });

    client.on("disconnect", function () {
        if (BLOCK_CONSOLE) console.log("DISCONNECTED");
        client.leave(clientInRoom, function () {
            removeUser(clientInRoom, screenName);
            io.to(clientInRoom).emit("userLeft", {username: screenName});
            clientInRoom = null;
            screenName = null;
        });
    });
});

app.use(function (req, res, next) {
    if (BLOCK_CONSOLE) console.log("HTTP Response", res.statusCode);
    return next();
});

app.use(express.static(__dirname + "/frontend"));

app.get("*", function (req, res) {
    res.sendFile(__dirname + "/frontend/index.html");
});

/* Expose server for testing */
module.exports = server.listen(PORT, function () {
    if (BLOCK_CONSOLE) console.log("HTTPS on port 3000");
});
