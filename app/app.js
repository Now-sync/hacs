var crypto =require("crypto");

var fs = require("fs");

// var Redis = require('ioredis');
// var redis = new Redis();

var express = require("express");
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.json());

var session = require("express-session");
app.use(session({
    secret: "its dat boii",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, sameSite: true }
}));


var privateKey = fs.readFileSync( "server.key" );
var certificate = fs.readFileSync( "server.crt" );
var config = {
        key: privateKey,
        cert: certificate,
        NPNProtocols: ['http/2.0', 'spdy', 'http/1.1', 'http/1.0']
};

/* New HTTPS server */
var https = require("https");
var server = https.createServer(config, app);
var io = require("socket.io")(server); 

/* -----------  -------------*/

var ROOM_NAME_LENGTH = 32;
var activeRooms = {};

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    return next();
});

/* http://stackoverflow.com/questions/35408729/express-js-prevent-get-favicon-ico */
app.get("/favicon.ico", function(req, res, next) {
    /* Remove this GET method if necessary.
    Only here to prevent favicon error console spam */
    res.status(200).end();
    return next();
});

app.get("/", function (req, res, next) {
    if (!req.session.group) return res.redirect("/index.html");
    return next();
});

/* Create Room */
app.put("/api/createroom/", function (req, res, next){
    var roomPassword = req.body.roomPassword;
    if (!roomPassword) {
        res.status(400).end("No Room Password Give");
        return next();
    }

    if (!screenName) {
        screenName = "user_" + crypto.randomBytes(8).toString("base64");
    }

    var new_room_name = crypto.randomBytes(ROOM_NAME_LENGTH).toString("base64");

    /* Add new room to db and set room password HERE*/

    var sessData = {};
    sessData.roomname = new_room_name;  
    req.session.datum = sessData;  // Give room creator the session

    res.json({roomname: new_room_name});  // respond with roomname
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

    if (true) {
        var sessData = {};
        sessData.roomname = roomname;  
        req.session.datum = sessData;
        res.json({roomname: roomname});
    } else {
        res.status(401).end("401 Unauthorized");
    }

    return next();
});

app.get("/room/:room_id", function (req, res, next) {
    /* User has arrived on site with direct link to a room */
    var roomId = req.params.room_id;

    if (true) {
        /* IF room exists do something */
    } else {
        /* IF room does NOT exists, do something else */
    }

    return next();
});


/* Sockets */

/* Uncomment below when sessions are properly implemented */
// io.use(function(socket, next) {
//     if (socket.request.session) next();
//     next(new Error("No Authentic Session Error"));
// });

io.on("connection", function(client){
    console.log("NEW CONNECTION");

    var clientInRoom = null;
    var screenName = null;

    client.on("join", function(data){
        var roomname = data.roomname;
        var username = data.username;

        if (!username) {
            username = "user_" + crypto.randomBytes(8).toString("base64");
        }

        console.log("User:", username, "has joined room:", roomname);

        screenName = username;

        if (clientInRoom) {
            client.leave(clientInRoom, function() {
                io.to(clientInRoom).emit("userLeft", {username:screenName});
            });
        }

        client.join(roomname, function(err){
            clientInRoom = roomname;
            io.to(clientInRoom).emit("userJoined", {username:screenName});
        });

        console.log(client.rooms);
    });

    client.on("pause", function(pausedtime){
        console.log("Socket signal pause");

        if (clientInRoom) io.to(clientInRoom).emit("pause", {pausedtime:pausedtime, username:screenName});    
    
    });

    client.on("play", function(){
        console.log("Socket signal play");

        if (clientInRoom) io.to(clientInRoom).emit("play", {username:screenName});    
    });

    client.on("disconnect", function(){
        console.log("DISCONNECTED");
        client.leave(clientInRoom, function() {
            io.to(clientInRoom).emit("userLeft", {username:screenName});
        });
    });
});

app.use(express.static("frontend"));  // This probably not be needed. Remove if see fit.


app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});

server.listen(3000, function () {
    console.log("HTTPS on port 3000");
});
