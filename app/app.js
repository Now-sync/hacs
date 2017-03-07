var path = require("path");

var crypto =require("crypto");

var fs = require("fs");

var express = require("express");
var app = express();

var multer = require("multer");
var upload  = multer({dest: "uploads/"});

/* New HTTPS server */
var https = require("https");
var server = https.createServer(config, app);
var io = require("socket.io")(server);  /* Attach https server to socket? */

// var Datastore = require("nedb");
// var db = new Datastore({ filename: "db/imageGroups.db", autoload: true });
// var comdb = new Datastore({ filename: "db/commentGroups.db", autoload: true, timestampData:true});
// var usrdb = new Datastore({ filename: "db/users.db", autoload: true});

var bodyParser = require("body-parser");
app.use(bodyParser.json());

var expressValidator = require("express-validator");

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
        cert: certificate
};



app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    return next();
});

app.use(expressValidator({
    customValidators: {
        fail: function(value){
            return false;
        }
    }
})); 


/* http://stackoverflow.com/questions/35408729/express-js-prevent-get-favicon-ico */
app.get("/favicon.ico", function(req, res, next) {
    /* Remove this GET method if necessary.
    Only here to prevent favicon error console spam */
    res.status(200).end();
    return next();
});

app.get("/signup/", function (req, res, next) {
    if (!req.session.group) return res.redirect("/signup.html");
    return next();
});

app.get("/", function (req, res, next) {
    if (!req.session.group) return res.redirect("/landing_page.html");
    return next();
});

app.put("/api/createroom/", function (req, res, next){

    /*DESCRIPTION:
    Return a room id string.
    Create room.*/
    var new_room_name = crypto.randomBytes(32).toString("base64");

});

app.get("/room/:room_id", function (req, res, next) {
    /* User has arrived on site with direct link to a room */
    if (/*exists*/) {
        /* IF room exists do something */
    } else {
        /* IF room does NOT exists, do something else */
    }

    return next();
});


/* Sockets */

io.on("connection", function(client){
    console.log("NEW CONNECTION");

    //var session_id = client.session.rand_str;

    var room = null;

    client.on("join", function(roomname){
        client.join(roomname, function(err){
            room = roomname;
            io.to(roomname, "a user has joined");
            next();
        });
    });

    client.on("pause", function(pausedtime){
        io.to(room).emit("pause", pausedtime);
        next();
    });

    client.on("play", function(){
        io.to(room).emit("play");
        next();
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



// app.listen(3000, function () {
//   console.log("App listening on port 3000");
// });