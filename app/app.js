var crypto =require("crypto");

var fs = require("fs");

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

var ROOM_NAME_LENGTH = 8;
var activeRooms = [];

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

app.put("/api/createroom/", function (req, res, next){

    /*DESCRIPTION:
    Return a room id string.
    Create room.*/
    var new_room_name = crypto.randomBytes(ROOM_NAME_LENGTH).toString("base64");

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

io.on("connection", function(client){
    console.log("NEW CONNECTION");

    var clientInRoom = null;

    client.on("join", function(roomname){
        console.log("Socket signal join " + roomname);

        if (clientInRoom) {
            client.leave(clientInRoom, function() {
                io.to(clientInRoom).emit("userLeft", "A user has left the room");
            });
        }

        client.join(roomname, function(err){
            clientInRoom = roomname;
            io.to(clientInRoom).emit("userJoined", "A user has joined the room");
        });
    });

    client.on("pause", function(pausedtime){
        console.log("Socket signal pause");

        if (clientInRoom) io.to(clientInRoom).emit("pause", pausedtime);    
    
    });

    client.on("play", function(){
        console.log("Socket signal play");

        if (clientInRoom) io.to(clientInRoom).emit("play");    
    });

    client.on("disconnect", function(){
        console.log("DISCONNECTED");
    });
});

app.use(express.static("frontend"));  // This probably not be needed. Remove if see fit.


app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});

server.listen(3000, function () {
    console.log("HTTPS on port 3000");
});
