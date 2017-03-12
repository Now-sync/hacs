var crypto = require("crypto");
var fs = require("fs");
var https = require("https");
var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var IO = require("socket.io");
var sharedsocses = require("express-socket.io-session");
var expressValidator = require("express-validator");

var app = express();

app.use(bodyParser.json());

var exprSess = session({
    secret: "its dat boii",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, sameSite: true }
});

app.use(exprSess);

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
/* Use dictionary for now until more research is done on databases */
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
        if (roomData.roomPassword === roompass) {
            callback(null, roomData);
        } else {
            callback("Password Does Not match", null);
        }
    } else {
        callback("No such room", null);
    }
};

/* every 10 seconds look for and remove dead rooms. */
var timeout = setInterval(function () {
    var key, currRoom;
    for (key in activeRooms) {
        currRoom = activeRooms[key];
        if (currRoom.activeUsers !== []) {
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
}

var addUserToRoom = function (roomname, username) {
    activeRooms[roomname].activeUsers.push(username);
}

var addNewRoom = function (roomname, roompass, videoUrl, callback) {
    activeRooms[roomname] = {
        roomPassword: roompass,
        activeUsers: [],
        videoUrl: videoUrl,
        videoTimeMaster: null,
        lastActive:null,
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

var youtubeUrlValidator = function(url) {
    /* regex taken from
    http://stackoverflow.com/questions/28735459/how-to-validate-youtube-url-in-client-side-in-text-box */
    var regExp = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return url !== undefined && url !== "" ? regExp.test(url) : false;
};

/* Commented to bypass eslint warnings */
// var refreshRoomActivity = function (roomname) {
//     /* Refresh room activity */
// };

// var destroyInactiveRooms = function () {
//     /* as function name */
//     /* this will probably called in a setTimer() */
// };

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

app.get("/", function (req, res, next) {
    if (!req.session.group) return res.redirect("/index.html");
    return next();
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
                        .toString("base64").replace(/\//g,'_').replace(/\+/g,'-');

    /* Add new room to db and set room password HERE*/
    addNewRoom(new_room_name, roomPassword, videoUrl, function (err) {
        if (err) {
            res.status(500).end("Database Error");
            return next();
        }
        var sessData = {};
        sessData.roomname = new_room_name;
        req.session.datum = sessData;  // Give room creator the session

        res.json({roomname: new_room_name});  // respond with roomname
        return next();
    });
});

/* Set Screen Name*/
app.post("/api/screenname/", function (req, res, next) {
    if (!req.session.datum) res.status(401).end("No Authorization");
	return next();
});

/* Get Session */
app.get("/api/session/", function (req, res, next) {
    /* A socket can only be established if there is valid session */
    var roomname = req.body.roomname;
    var roompass = req.body.password;
    if (!roomname || !roompass) {
        res.status(400).end("400 No room name or room password");
        return next();
    }

    verifyRoomAndPassword(roomname, roompass, function (err) {
        if (!err) {
            var sessData = {};
            sessData.roomname = roomname;
            req.session.datum = sessData;
            res.json({roomname: roomname});
        } else {
            res.status(401).end("401 Unauthorized");
        }
        return next();
    });
});

app.get("/room/:room_id/", function (req, res, next) {
    /* User has arrived on site with direct link to a room */
    //var roomId = req.params.room_id;

    if (true) {
        /* IF room exists do something */
    } else {
        /* IF room does NOT exists, do something else */
    }
    return next();
});


/* Sockets */

io.use(sharedsocses(exprSess, {autoSave: false}));

io.use(function(socket, next) {
    if (socket.handshake.session) {
        next();
    } else {
        next(new Error("No Authentic Session Error"));
    }
});

io.on("connection", function (client) {
    if (BLOCK_CONSOLE) console.log("NEW CONNECTION");

    var clientInRoom = null;
    var screenName = null;
    //var videoTimeMaster = null;  /* May be needed later */

    client.on("join", function (data) {
        var roomname = data.roomname;
        var roompass = data.roompass;
        var username = data.username;

        if (!roomname || !roompass) return; // maybe emit joinError ??

        verifyRoomAndPassword(roomname, roompass, function (err, roomData) {
            if (err) {
                /* Do something */
                return;
            }

            if (!username) {  // If joining room without given username, random name is generated.
                username = "user_" + crypto.randomBytes(8).toString("base64");
            }

            if (BLOCK_CONSOLE) console.log("User:", username, "has joined room:", roomname);

            screenName = username;

            if (clientInRoom) {
                client.leave(clientInRoom, function () {
                    removeUser(clientInRoom, screenName);
                    io.to(clientInRoom).emit("userLeft", {username: screenName});
                    clientInRoom = null;
                });
            }

            client.join(roomname, function (err) {
                if (err) {
                    /* Do something */
                    return;
                }
                clientInRoom = roomname;
                addUserToRoom(clientInRoom, screenName);
                io.to(clientInRoom).emit("userJoined", {username: screenName});

                /* When user has joined the room. Send the Url of the video in the room */
                // Note: skipTo is null until there is away to track video location.
                client.emit("videoChange", {
                    videoUrl: roomData.videoUrl,
                    username: null,  // null because no user emitted videoChange signal
                    skipTo: null
                });

            });

            if (BLOCK_CONSOLE) console.log(client.rooms);

        });

    });

    client.on("videoChange", function (data) {
        if (BLOCK_CONSOLE) console.log("Socket signal video change");

        if (clientInRoom) {
            setRoomVideo(clientInRoom, data.videoUrl, function() {
                io.to(clientInRoom).emit("videoChange", {
                    videoUrl: data.videoUrl,
                    username: screenName,
                    skipTo: null  // A time in the video
                });
            });
        }
    });

    client.on("pause", function (data) {
        if (BLOCK_CONSOLE) console.log("Socket signal pause");
        if (!data) {
            if (BLOCK_CONSOLE) console.log("no data given in signal pause");
            return;
        } else if (data && !data.pausedtime) {
            if (BLOCK_CONSOLE) console.log("no pause time given in pause signal");
            return;
        }
        if (clientInRoom) io.to(clientInRoom).emit("pause", {pausedtime: data.pausedtime, username: screenName});
    });

    client.on("play", function () {
        if (BLOCK_CONSOLE) console.log("Socket signal play");

        if (clientInRoom) io.to(clientInRoom).emit("play", {username: screenName});
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

app.use(express.static(__dirname + "/frontend"));

app.use(function (req, res, next) {
    if (BLOCK_CONSOLE) console.log("HTTP Response", res.statusCode);
    return next();
});

/* Expose server for testing */
module.exports = server.listen(PORT, function () {
    if (BLOCK_CONSOLE) console.log("HTTPS on port 3000");
});
