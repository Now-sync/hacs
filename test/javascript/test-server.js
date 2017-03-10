process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";  // This is supposedly very bad
process.env.NODE_ENV = "test";
var chai = require("chai");
var chaiHttp = require("chai-http");
var server = require("../../src/app.js");
var should = chai.should();
var io = require("socket.io-client");
var socketUrl = "https://localhost:3002";
var options = {
    transports: ["websocket"],
    "force new connection": true
};

chai.use(chaiHttp);

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
        var personA, personB, personC;
        var roomname;
        before(function (){
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: "random", screenName: "Mallory"})
                .end(function (res) {
                    roomname = res.body.roomname;
                });
        });

        afterEach(function(){
            try{
                personA.disconnect();
            } finally {/* Do nothing */}

            try{
                personB.disconnect();
            } finally {/* Do nothing */}

            try{
                personC.disconnect();
            } finally {/* Do nothing */}

        });

        it("should broadcast play to all users in the same room", function (done) {
            var countA = 0, countB = 0, countC = 0, expect = 1;
            personA = io.connect(socketUrl, options);
            personA.on("connect", function() {
                personA.emit("join", {roomname: roomname, roompass: "password", username: "personA"});
                personB = io.connect(socketUrl, options);
                personB.on("connect", function() {
                    personB.emit("join", {roomname: roomname, roompass: "password", username: "personB"});
                    personC = io.connect(socketUrl, options);
                    personC.on("connect", function() {
                        personC.emit("join", {roomname: roomname, roompass: "password", username: "personC"});
                        personC.on("play", function () {
                            countC++;
                            if (countA === expect && countB === expect && countC === expect) {
                                done();
                            }
                        });
                        personC.on("userJoined", function () {
                            personA.emit("play");

                        });
                    });

                    personB.on("play", function () {
                        countB++;
                        if (countA === expect && countB === expect && countC === expect) {
                            done();
                        }
                    });
                });
                
                personA.on("play", function () {
                    countA++;
                    if (countA === expect && countB === expect && countC === expect) {
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
                    personA = io.connect(socketUrl, options);
                    personA.on("connect", function () {
                        personA.emit("join", {roomname: roomname2, roompass: "password", username: "personA"});
                        personB = io.connect(socketUrl, options);
                        personB.on("connect", function() {
                            personB.emit("join", {roomname: roomname, roompass: "password", username: "personB"});
                            personB.on("userJoined", function () {
                                personA.emit("play");
                                personB.emit("play");
                            });
                            personB.on("play", function () {
                                counter2++;
                                if (counter1 === 1 && counter2 === 1) {
                                    done();
                                }
                            });
                        });

                        personA.on("play", function () {
                            counter1++;
                            if (counter1 === 1 && counter2 === 1) {
                                done();
                            }
                        });
                    });
                });
        });
    });

    describe("Test emit pause", function() {
        var personA, personB, personC;
        var roomname;
        before(function (){
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: "random", screenName: "Mallory"})
                .end(function (res) {
                    roomname = res.body.roomname;
                });
        });

        afterEach(function(){
            try{
                personA.disconnect();
            } finally {/* Do nothing */}

            try{
                personB.disconnect();
            } finally {/* Do nothing */}

            try{
                personC.disconnect();
            } finally {/* Do nothing */}

        });

        it("should broadcast pause to all users in the same room", function (done) {
            var countA = 0, countB = 0, countC = 0, expect = 1;
            personA = io.connect(socketUrl, options);
            personA.on("connect", function() {
                personA.emit("join", {roomname: roomname, roompass: "password", username: "personA"});
                personB = io.connect(socketUrl, options);
                personB.on("connect", function() {
                    personB.emit("join", {roomname: roomname, roompass: "password", username: "personB"});
                    personC = io.connect(socketUrl, options);
                    personC.on("connect", function() {
                        personC.emit("join", {roomname: roomname, roompass: "password", username: "personC"});
                        personC.on("pause", function() {
                            countC++;
                            if (countA === expect && countB === expect && countC === expect) {
                                done();
                            }
                        });
                        personC.on("userJoined", function () {
                            personA.emit("pause", {pausedtime: "not_empty"});

                        });
                    });

                    personB.on("pause", function () {
                        countB++;
                        if (countA === expect && countB === expect && countC === expect) {
                            done();
                        }
                    });
                });
                
                personA.on("pause", function () {
                    countA++;
                    if (countA === expect && countB === expect && countC === expect) {
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
                    personA = io.connect(socketUrl, options);
                    personA.on("connect", function () {
                        personA.emit("join", {roomname: roomname2, roompass: "password", username: "personA"});
                        personB = io.connect(socketUrl, options);
                        personB.on("connect", function() {
                            personB.emit("join", {roomname: roomname, roompass: "password", username: "personB"});
                            personB.on("userJoined", function () {
                                personA.emit("pause", {pausedtime: "not_empty"});
                                personB.emit("pause", {pausedtime: "not_empty"});
                            });
                            personB.on("pause", function () {
                                counter2++;
                                if (counter1 === 1 && counter2 === 1) {
                                    done();
                                }
                            });
                        });

                        personA.on("pause", function () {
                            counter1++;
                            if (counter1 === 1 && counter2 === 1) {
                                done();
                            }
                        });
                    });
                });
        });

        it("should transmit time paused", function (done) {
            var pausedtime = "59:59";
            personA = io.connect(socketUrl, options);
            personA.on("connect", function () {
                personA.emit("join", {roomname: roomname, roompass: "password", username: "personA"});
                personB = io.connect(socketUrl, options);
                personB.on("connect", function () {
                    personB.emit("join", {roomname: roomname, roompass: "password", username: "personB"});
                    personB.on("pause", function (data) {
                        if (data.pausedtime === pausedtime) {
                            done();
                        }
                    });
                    personB.on("userJoined", function () {
                        personA.emit("pause", {pausedtime: pausedtime});
                    });
                });
            });
        });
    });
});