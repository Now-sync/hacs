process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";  // This is supposedly very bad
process.env.NODE_ENV = "test";
var chai = require("chai");
var chaiHttp = require("chai-http");
var server = require("../../src/app.js");
var should = chai.should();
var io = require("socket.io-client");
var socketUrl = "https://localhost:3000";
var options = {
    transports: ["websocket"],
    "force new connection": true
};

chai.use(chaiHttp);

var BLOCK_CONSOLE = false;

describe("All server testing", function () {

    describe("Create room", function() {

        it("should return a status code 200", function (done) {
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: "random", screenName: "Mallory"})
                .end(function (res) {
                    res.should.have.status(200);
                    done();
                });
        });

        it("should have a return with property roomname", function (done) {
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: "random", screenName: "Mallory"})
                .end(function (res) {
                    res.body.should.have.property("roomname");
                    done();
                });
        });

        /* Comprehensive test */
        it("should return a string as room name and room should exist", function (done) {
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: "random", screenName: "Mallory"})
                .end(function (res) {
                    chai.request(server)
                        .get("/api/session/")
                        .send({roomname: res.body.roomname, password: "password"})
                        .end(function (res2) {
                            res2.body.roomname.should.equal(res.body.roomname);
                            done();
                    });
            });
        });


    });

    describe("Test emit play", function() {

        var roomname;
        beforeEach(function (){
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: "random", screenName: "Mallory"})
                .end(function (res) {
                    roomname = res.body.roomname;
                });
        });

        it("should broadcast play to all users in the same room", function (done) {
            var expect = 3;
            var messageCounter = 0;
            var personA = io.connect(socketUrl, options);
            personA.on("connect", function() {
                personA.emit("join", {roomname: roomname, username: "personA"});
                var personB = io.connect(socketUrl, options);
                personB.on("connect", function() {
                    personB.emit("join", {roomname: roomname, username: "personB"});
                    var personC = io.connect(socketUrl, options);
                    personC.on("connect", function() {
                        personC.emit("join", {roomname: roomname, username: "personC"});
                        personC.on("play", function(data) {
                            messageCounter++;
                            if (messageCounter === expect) {
                                done();
                            }
                        });
                        personC.on("userJoined", function (data) {
                            personA.emit("play");

                        });
                    });

                    personB.on("play", function (data) {
                        messageCounter++;
                        if (messageCounter === expect) {
                            done();
                        }
                    });
                });
                
                personA.on("play", function (data) {
                    messageCounter++;
                    if (messageCounter === expect) {
                        done();
                    }
                });
            });
        });

        it("should not broadcast in other rooms", function (done) {
            /* Create new room */
            var counter1 = 0, counter2 = 0;
            var roomname2;
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: "random", screenName: "Mallory"})
                .end(function (res) {
                    roomname2 = res.body.roomname;
                    var personA = io.connect(socketUrl, options);
                    personA.on("connect", function () {
                        personA.emit("join", {roomname: roomname2, username: "personA"});
                        var personB = io.connect(socketUrl, options);
                        personB.on("connect", function() {
                            personB.emit("join", {roomname: roomname, username: "personB"});
                            personB.on("userJoined", function (data) {
                                personA.emit("play");
                                personB.emit("play");
                            });
                            personB.on("play", function (data) {
                                counter2++;
                                if (counter1 === 1 && counter2 === 1) {
                                    done();
                                }
                            });
                        });

                        personA.on("play", function (data) {
                            counter1++;
                            if (counter1 === 1 && counter2 === 1) {
                                done();
                            }
                        });
                    });
                });
        });
    });
});