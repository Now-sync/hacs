process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";  // This is supposedly very bad
process.env.NODE_ENV = "test";
var chai = require("chai");
var chaiHttp = require("chai-http");
var server = require("../src/app.js");
var should = chai.should();
var expect = chai.expect;
var io = require("socket.io-client");
var socketUrl = "https://localhost:3002";
var options = {
    transports: ["websocket"],
    "force new connection": true
};

chai.use(chaiHttp);

describe("All server testing", function () {

    describe("Create room", function() {
        var videoUrl = "https://www.youtube.com/watch?v=rJdMFyxd8ps";
        it("should return a status code 200", function (done) {
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: videoUrl})
                .end(function (res) {
                    res.should.have.status(200);
                    done();
                });
        });

        it("should have a return with property roomname", function (done) {
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: videoUrl})
                .end(function (res) {
                    res.body.should.have.property("roomname");
                    done();
                });
        });

        /* Comprehensive test */
        it("should return a string as room name and room should exist", function (done) {
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: videoUrl})
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

    describe("Test Validator", function() {
        var goodUrl = "https://www.youtube.com/watch?v=_OBlgSz8sSM";
        var badUrl1 = "wwwadasfVsfOSbJY0";
        var badUrl2 = "asdas://www.youtube.com/watch?v=kfVsfOSbJY0";  // no protocol
        var badUrl3 = "https://www.youtube.com/?v=_OBlgSsdM";  // too short
        var badUrl4 = "https://www.youtub.com/watch?v=_OBlgSz8sSM";

        it("should accept well formed urls", function (done){
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: goodUrl})
                .end(function (res) {
                    res.should.have.status(200);
                    done();
                });
        });

        it("should reject poorly formed url1", function (done){
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: badUrl1})
                .end(function (res) {
                    res.should.have.status(400);
                    done();
                });
        });

        it("should reject no protocol", function (done){
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: badUrl2})
                .end(function (res) {
                    res.should.have.status(400);
                    done();
                });
        });

        it("should reject url too short", function (done){
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: badUrl3})
                .end(function (res) {
                    res.should.have.status(400);
                    done();
                });
        });

        it("should reject misspelled 'youtube'", function (done){
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: badUrl4})
                .end(function (res) {
                    res.should.have.status(400);
                    done();
                });
        });
    });

    describe("Test emit play", function() {
        var personA, personB, personC;
        var roomname;
        var videoUrl = "https://www.youtube.com/watch?v=7PCkvCPvDXk";
        var password = "password";
        before(function (done){
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: password, videoUrl: videoUrl})
                .end(function (res) {
                    roomname = res.body.roomname;
                    done();
                });
        });

        beforeEach(function (done){
            var createRoom = function () {
                return new Promise(function (acc) {
                    chai.request(server)
                        .put("/api/createroom/")
                        .send({roomPassword: password, videoUrl: videoUrl})
                        .end(function (res) {
                            acc(res.body.roomname);
                        });
                });
            };

            var connectPersonA = function (roomname){
                return new Promise(function (acc) {
                    personA = io.connect(socketUrl, options);
                    personA.on("connect", function () {
                        personA.once("videoChange", function() { acc(); })
                                .emit("join", {roomname: roomname, roompass: password, username: "personA"});
                    });
                });
            };

            var connectPersonB = function (roomname){
                return new Promise(function (acc) {
                    personB = io.connect(socketUrl, options);
                    personB.on("connect", function () {
                        personB.once("videoChange", function() { acc(); })
                            .emit("join", {roomname: roomname, roompass: password, username: "personB"});
                    });
                });
            };

            var connectPersonC = function (roomname){
                return new Promise(function (acc) {
                    personC = io.connect(socketUrl, options);
                    personC.on("connect", function () {
                        personC.once("videoChange", function() { acc(); })
                            .emit("join", {roomname: roomname, roompass: password, username: "personC"});
                    });
                });
            };

            createRoom().then(function (roomname2) {
                roomname = roomname2;
                var p = [connectPersonA(roomname), connectPersonB(roomname), connectPersonC(roomname)];
                Promise.all(p).then(function () { done(); });
            });
        });

        afterEach(function(done){
            try{
                personA.disconnect();
            } finally {
                try{
                    personB.disconnect();
                } finally {
                    try{
                        personC.disconnect();
                    } finally {
                        done();
                    }
                }
            }
        });

        it("should broadcast play to all users in the same room", function (done) {
            var personAListen = function () {
                return new Promise(function (acc) {
                    personA.on("play", function () {
                        acc();
                    });
                });
            };

            var personBListen = function() {
                return new Promise(function (acc) {
                    personB.on("play", function () {
                        acc();
                    });
                });
            };

            var personCListen = function() {
                return new Promise(function (acc) {
                    personC.on("play", function () {
                        acc();
                    });
                });
            };

            var p = [personAListen(), personBListen(), personCListen()];
            Promise.all(p).then(function () {
                done();
            });

            personA.emit("play");
        });

        it("should not broadcast in other rooms", function (done) {
            /* Create new room */
            var counter1 = 0, counter2 = 0;
            var roomname2;
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: videoUrl})
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

    /* Test emit pause */
    describe("Test emit pause", function() {
        var personA, personB, personC;
        var roomname;
        var videoUrl = "https://www.youtube.com/watch?v=kfVsfOSbJY0";
        var password = "password";

        beforeEach(function (done){
            var createRoom = function () {
                return new Promise(function (acc) {
                    chai.request(server)
                        .put("/api/createroom/")
                        .send({roomPassword: "password", videoUrl: videoUrl})
                        .end(function (res) {
                            acc(res.body.roomname);
                        });
                });
            };

            var connectPersonA = function (roomname){
                return new Promise(function (acc) {
                    personA = io.connect(socketUrl, options);
                    personA.on("connect", function () {
                        personA.once("videoChange", function() { acc(); })
                                .emit("join", {roomname: roomname, roompass: password, username: "personA"});
                    });
                });
            };

            var connectPersonB = function (roomname){
                return new Promise(function (acc) {
                    personB = io.connect(socketUrl, options);
                    personB.on("connect", function () {
                        personB.once("videoChange", function() { acc(); })
                            .emit("join", {roomname: roomname, roompass: password, username: "personB"});
                    });
                });
            };

            var connectPersonC = function (roomname){
                return new Promise(function (acc) {
                    personC = io.connect(socketUrl, options);
                    personC.on("connect", function () {
                        personC.once("videoChange", function() { acc(); })
                            .emit("join", {roomname: roomname, roompass: password, username: "personC"});
                    });
                });
            };

            createRoom().then(function (roomname2) {
                roomname = roomname2;
                var p = [connectPersonA(roomname), connectPersonB(roomname), connectPersonC(roomname)];
                Promise.all(p).then(function () { done(); });
            });
        });

        afterEach(function (done){
            try{
                personA.disconnect();
            } finally {
                try{
                    personB.disconnect();
                } finally {
                    try{
                        personC.disconnect();
                    } finally {
                        done();
                    }
                }
            }
        });

        it("should broadcast pause to all users in the same room", function (done) {

            var personBListen = function() {
                return new Promise(function (acc) {
                    personB.on("pause", function () {
                        acc();
                    });
                });
            };

            var personCListen = function() {
                return new Promise(function (acc) {
                    personC.on("pause", function () {
                        acc();
                    });
                });
            };

            var p = [personBListen(), personCListen()];
            Promise.all(p).then(function () {
                done();
            });

            personA.emit("pause", {pausedtime: "not_empty"});
        });

        xit("should not broadcast in other rooms", function (done) {
            /* Create new room */
            var password2 = "password2";
            var token1 = "token1_adgjnd";
            var token2 = "token2_dajyhm";
            var personOther;
            var createRoomOther = function () {
                return new Promise(function (acc) {
                    chai.request(server)
                        .put("/api/createroom/")
                        .send({roomPassword: password2, videoUrl: videoUrl})
                        .end(function (res) {
                            acc(res.body.roomname);
                        });
                });
            };

            var connectPersonOther = function (roomname){
                return new Promise(function (acc) {
                    personOther = io.connect(socketUrl, options);
                    personOther.on("connect", function () {
                        personOther.once("videoChange", function() {acc();})
                            .emit("join", {roomname: roomname, roompass: password2, username: "personOther"});
                    });
                });
            };

            var personAListen = function() {
                return new Promise(function (acc) {
                    personA.on("pause", function (data) {
                        expect(token1).to.equal(data.pausedtime);
                        done();
                    });

                    acc();
                });
            };

            createRoomOther().then(function (roomname) {
                return connectPersonOther(roomname);
            }).then(function () {
                return personAListen();
            }).then(function () {
                personOther.emit("pause", {pausedtime: token2});
                personA.emit("pause", {pausedtime: token1});
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

    /* Test emit video change */
    describe("Test emit video change", function() {
        var personA, personB, personC;
        var videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        var newVideo = "https://www.youtube.com/watch?v=ZyhrYis509A";
        var roomname;
        var password = "password";

        beforeEach(function (done){
            var createRoom = function () {
                return new Promise(function (acc) {
                    chai.request(server)
                        .put("/api/createroom/")
                        .send({roomPassword: "password", videoUrl: videoUrl})
                        .end(function (res) {
                            acc(res.body.roomname);
                        });
                });
            };

            var connectPersonA = function (roomname){
                return new Promise(function (acc) {
                    personA = io.connect(socketUrl, options);
                    personA.on("connect", function () {
                        personA.once("videoChange", function() { acc(); })
                            .emit("join", {roomname: roomname, roompass: password, username: "personA"});
                    });
                });
            };

            var connectPersonB = function (roomname){
                return new Promise(function (acc) {
                    personB = io.connect(socketUrl, options);
                    personB.on("connect", function () {
                        personB.once("videoChange", function() { acc(); })
                            .emit("join", {roomname: roomname, roompass: password, username: "personB"});
                    });
                });
            };

            var connectPersonC = function (roomname){
                return new Promise(function (acc) {
                    personC = io.connect(socketUrl, options);
                    personC.on("connect", function () {
                        personC.once("videoChange", function() { acc(); })
                            .emit("join", {roomname: roomname, roompass: password, username: "personC"});
                    });
                });
            };

            createRoom().then(function (roomname2) {
                roomname = roomname2;
                var p = [connectPersonA(roomname), connectPersonB(roomname), connectPersonC(roomname)];
                return Promise.all(p);
            }).then(function () { done(); });
        });

        afterEach(function (done){
            try{
                personA.disconnect();
            } finally {
                try{
                    personB.disconnect();
                } finally {
                    try{
                        personC.disconnect();
                    } finally {
                        done();
                    }
                }
            }
        });

        it("should broadcast video change to all users in the same room", function (done) {
            var personAListen = function () {
                return new Promise(function (acc) {
                    personA.on("videoChange", function () {
                        acc();
                    });
                });
            };

            var personBListen = function() {
                return new Promise(function (acc) {
                    personB.on("videoChange", function () {
                        acc();
                    });
                });
            };

            var personCListen = function() {
                return new Promise(function (acc) {
                    personC.on("videoChange", function () {
                        acc();
                    });
                });
            };

            var p = [personAListen(), personBListen(), personCListen()];
            Promise.all(p).then(function () { done(); });

            personA.emit("videoChange", {videoUrl: newVideo});

        });

        it("should not broadcast in other rooms", function (done) {
            /* Fails if one or both recieves more than 1 videoChange signal */
            var countA = 0, countOther = 0;
            var roomname2;
            var personOther;
            var videoUrl2 = "https://www.youtube.com/watch?v=Zi_XLOBDo_Y";
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: videoUrl2})
                .end(function (res) {
                    roomname2 = res.body.roomname;
                    personOther = io.connect(socketUrl, options);
                    personOther.on("connect", function(){
                        personOther.emit("join", {roomname: roomname2, roompass: "password", username: "personOther"});
                        personOther.once("videoChange", function () { /*Do nothing on video change. Catches first useless video change*/
                            personA.on("videoChange", function () {
                                countA++;
                                if (countA === 1 && countOther === 1) {
                                    done();
                                }
                            });
                            personOther.on("videoChange", function () {
                                countOther++;
                                if (countA === 1 && countOther === 1) {
                                    done();
                                }
                            });
                            personOther.emit("videoChange", {videoUrl: newVideo});
                            personA.emit("videoChange", {videoUrl: newVideo});
                        });
                    });
                });
        });

        it("should transmit video Url to all in room", function (done) {
            var countA = false, countB = false, countC = false;
            personA.on("videoChange", function (data) {
                countA = data.videoUrl === newVideo;
                if (countA && countB && countC) {
                    done();
                }
            });

            personB.on("videoChange", function (data) {
                countB = data.videoUrl === newVideo;
                if (countA && countB && countC) {
                    done();
                }
            });

            personC.on("videoChange", function (data) {
                countC = data.videoUrl === newVideo;
                if (countA && countB && countC) {
                    done();
                }
            });

            personA.emit("videoChange", {videoUrl: newVideo});
        });

        it("should should receive correct video when joining room", function (done) {
            personA.on("videoChange", function (data) {
                expect(data.videoUrl).to.equal(videoUrl);
                done();
            }).emit("join", {roomname: roomname, roompass: password, username: "personA"});
        });
    });

    /* Test emit skipTo */
    describe("Test emit skipTo", function() {
        var personA, personB, personC;
        var roomname;
        var videoUrl = "https://www.youtube.com/watch?v=kfVsfOSbJY0";
        var password = "password";

        beforeEach(function (done){
            var createRoom = function () {
                return new Promise(function (acc) {
                    chai.request(server)
                        .put("/api/createroom/")
                        .send({roomPassword: "password", videoUrl: videoUrl})
                        .end(function (res) {
                            acc(res.body.roomname);
                        });
                });
            };

            var connectPersonA = function (roomname){
                return new Promise(function (acc) {
                    personA = io.connect(socketUrl, options);
                    personA.on("connect", function () {
                        personA.once("videoChange", function() { acc(); })
                                .emit("join", {roomname: roomname, roompass: password, username: "personA"});
                    });
                });
            };

            var connectPersonB = function (roomname){
                return new Promise(function (acc) {
                    personB = io.connect(socketUrl, options);
                    personB.on("connect", function () {
                        personB.once("videoChange", function() { acc(); })
                            .emit("join", {roomname: roomname, roompass: password, username: "personB"});
                    });
                });
            };

            var connectPersonC = function (roomname){
                return new Promise(function (acc) {
                    personC = io.connect(socketUrl, options);
                    personC.on("connect", function () {
                        personC.once("videoChange", function() { acc(); })
                            .emit("join", {roomname: roomname, roompass: password, username: "personC"});
                    });
                });
            };

            createRoom().then(function (roomname2) {
                roomname = roomname2;
                var p = [connectPersonA(roomname), connectPersonB(roomname), connectPersonC(roomname)];
                Promise.all(p).then(function () { done(); });
            });
        });

        afterEach(function (done){
            try{
                personA.disconnect();
            } finally {
                try{
                    personB.disconnect();
                } finally {
                    try{
                        personC.disconnect();
                    } finally {
                        done();
                    }
                }
            }
        });

        it("should broadcast skipTo to all users in the same room", function (done) {

            var personAListen = function () {
                return new Promise(function (acc) {
                    personA.on("skipTo", function () {
                        acc();
                    });
                });
            };

            var personBListen = function() {
                return new Promise(function (acc) {
                    personB.on("skipTo", function () {
                        acc();
                    });
                });
            };

            var personCListen = function() {
                return new Promise(function (acc) {
                    personC.on("skipTo", function () {
                        acc();
                    });
                });
            };

            var p = [personAListen(), personBListen(), personCListen()];
            Promise.all(p).then(function () {
                done();
            });

            personA.emit("skipTo", {skipToTime: "not_empty"});
        });

        it("should not broadcast in other rooms", function (done) {
            /* Create new room */
            var password2 = "password2";
            var token1 = "token1_adgjnd";
            var token2 = "token2_dajyhm";
            var personOther;
            var createRoomOther = function () {
                return new Promise(function (acc) {
                    chai.request(server)
                        .put("/api/createroom/")
                        .send({roomPassword: password2, videoUrl: videoUrl})
                        .end(function (res) {
                            acc(res.body.roomname);
                        });
                });
            };

            var connectPersonOther = function (roomname){
                return new Promise(function (acc) {
                    personOther = io.connect(socketUrl, options);
                    personOther.on("connect", function () {
                        personOther.once("videoChange", function() {acc();})
                            .emit("join", {roomname: roomname, roompass: password2, username: "personOther"});
                    });
                });
            };

            var personAListen = function() {
                return new Promise(function (acc) {
                    personA.on("skipTo", function (data) {
                        expect(token1).to.equal(data.skipToTime);
                        done();
                    });

                    acc();
                });
            };

            createRoomOther().then(function (roomname) {
                return connectPersonOther(roomname);
            }).then(function () {
                return personAListen();
            }).then(function () {
                personOther.emit("skipTo", {skipToTime: token2});
                personA.emit("skipTo", {skipToTime: token1});
            });
        });

        it("should transmit time skipTo", function (done) {
            var skipToTime = "59:59";
            personA = io.connect(socketUrl, options);
            personA.on("connect", function () {
                personA.emit("join", {roomname: roomname, roompass: "password", username: "personA"});
                personB = io.connect(socketUrl, options);
                personB.on("connect", function () {
                    personB.emit("join", {roomname: roomname, roompass: "password", username: "personB"});
                    personB.on("skipTo", function (data) {
                        if (data.skipToTime === skipToTime) {
                            done();
                        }
                    });
                    personB.on("userJoined", function () {
                        personA.emit("skipTo", {skipToTime: skipToTime});
                    });
                });
            });
        });
    });

    describe("Test requestTime and currentTime signal", function() {
        var personA, personB, personC;
        var roomname;
        var videoUrl = "https://www.youtube.com/watch?v=kfVsfOSbJY0";
        var password = "password";

        beforeEach(function (done){
            var createRoom = function () {
                return new Promise(function (acc) {
                    chai.request(server)
                        .put("/api/createroom/")
                        .send({roomPassword: "password", videoUrl: videoUrl})
                        .end(function (res) {
                            acc(res.body.roomname);
                        });
                });
            };

            var connectPersonA = function (roomname){
                return new Promise(function (acc) {
                    personA = io.connect(socketUrl, options);
                    personA.on("connect", function () {
                        personA.once("requestTime", function() {
                            personA.once("requestTime", function() {
                                acc();
                            });
                        });
                        personA.emit("join", {roomname: roomname, roompass: password, username: "personA"});
                    });
                });
            };

            var connectPersonB = function (roomname){
                return new Promise(function (acc) {
                    personB = io.connect(socketUrl, options);
                    personB.on("connect", function () {
                        personB.emit("join", {roomname: roomname, roompass: password, username: "personB"});
                        acc();
                    });
                });
            };

            var connectPersonC = function (roomname){
                return new Promise(function (acc) {
                    personC = io.connect(socketUrl, options);
                    personC.on("connect", function () {
                        personC.emit("join", {roomname: roomname, roompass: password, username: "personC"});
                        acc();
                    });
                });
            };

            createRoom().then(function (roomname2) {
                roomname = roomname2;
                var p = [connectPersonA(roomname), connectPersonB(roomname), connectPersonC(roomname)];
                Promise.all(p).then(function () { done(); });
            });
        });

        afterEach(function (done){
            try{
                personA.disconnect();
            } finally {
                try{
                    personB.disconnect();
                } finally {
                    try{
                        personC.disconnect();
                    } finally {
                        done();
                    }
                }
            }
        });

        it("should sent requestTime to personA when joining room", function (done) {
            var personOther;
            personA.on("requestTime", function () {
                done();
            });

            personOther = io.connect(socketUrl, options);
            personOther.on("connect", function () {
                personOther.emit("join", {roomname: roomname, roompass: password, username: "personOther"});
            });
        });

        it("should receive skipTo after joining the room", function (done) {
            var personOther = io.connect(socketUrl, options);
            var token = "kkfudnsm8g6b4dh";
            personA.on("requestTime", function () {
                /* PersonA responds to requestTime */
                personA.emit("currentTime", {currTime: token});
            });

            personOther.on("connect", function () {
                personOther.emit("join", {roomname: roomname, roompass: password, username: "personOther"});
            });

            personOther.on("skipTo", function (data) {
                expect(data.skipToTime).to.equal(token);
                done();
            });
        });
    });

    describe("Test sendMessage and receivedMessage signal", function() {
        var personA, personB, personC;
        var roomname;
        var videoUrl = "https://www.youtube.com/watch?v=kfVsfOSbJY0";
        var password = "password";

        beforeEach(function (done){
            var createRoom = function () {
                return new Promise(function (acc) {
                    chai.request(server)
                        .put("/api/createroom/")
                        .send({roomPassword: "password", videoUrl: videoUrl})
                        .end(function (res) {
                            acc(res.body.roomname);
                        });
                });
            };

            var connectPersonA = function (roomname){
                return new Promise(function (acc) {
                    personA = io.connect(socketUrl, options);
                    personA.on("connect", function () {
                        personA.once("requestTime", function() {
                            personA.once("requestTime", function() {
                                acc();
                            });
                        });
                        personA.emit("join", {roomname: roomname, roompass: password, username: "personA"});
                    });
                });
            };

            var connectPersonB = function (roomname){
                return new Promise(function (acc) {
                    personB = io.connect(socketUrl, options);
                    personB.on("connect", function () {
                        personB.emit("join", {roomname: roomname, roompass: password, username: "personB"});
                        acc();
                    });
                });
            };

            var connectPersonC = function (roomname){
                return new Promise(function (acc) {
                    personC = io.connect(socketUrl, options);
                    personC.on("connect", function () {
                        personC.emit("join", {roomname: roomname, roompass: password, username: "personC"});
                        acc();
                    });
                });
            };

            createRoom().then(function (roomname2) {
                roomname = roomname2;
                var p = [connectPersonA(roomname), connectPersonB(roomname), connectPersonC(roomname)];
                Promise.all(p).then(function () { done(); });
            });
        });

        afterEach(function (done){
            try{
                personA.disconnect();
            } finally {
                try{
                    personB.disconnect();
                } finally {
                    try{
                        personC.disconnect();
                    } finally {
                        done();
                    }
                }
            }
        });

        it("should broadcast receivedMessage to all other users", function (done) {
            var message = "a;kljghfnflpawyehfb;lnbkljhasdfjnblsaghde";
            var videoTime = 95654;

            var personBListen = function() {
                return new Promise(function (acc) {
                    personB.on("receivedMessage", function (data) {
                        if (data.content === message && data.videoTime === videoTime){
                            acc();
                        }
                    });
                });
            };

            var personCListen = function() {
                return new Promise(function (acc) {
                    personC.on("receivedMessage", function (data) {
                        if (data.content === message && data.videoTime === videoTime){
                            acc();
                        }
                    });
                });
            };

            var p = [personBListen(), personCListen()];
            Promise.all(p).then(function () {
                done();
            });

            personA.emit("sendMessage", {content:message, videoTime:videoTime});
        });

        it("should broadcast with timeStamp correct time", function (done) {
            var message = "a;kljghfnflpawyehfb;lnbkljhasdfjnblsaghde";
            var videoTime = 95654;
            var millsecTolerance = 100;

            var personBListen = function() {
                return new Promise(function (acc) {
                    personB.on("receivedMessage", function (data) {
                        var now = new Date();
                        if (Math.abs((new Date(data.timeStamp)) - now.getTime()) < millsecTolerance) {
                            acc();
                        }
                    });
                });
            };

            var personCListen = function() {
                return new Promise(function (acc) {
                    personC.on("receivedMessage", function (data) {
                        var now = new Date();
                        if (Math.abs((new Date(data.timeStamp)) - now.getTime()) < millsecTolerance) {
                            acc();
                        }
                    });
                });
            };

            var p = [personBListen(), personCListen()];
            Promise.all(p).then(function () {
                done();
            });

            personA.emit("sendMessage", {content:message, videoTime:videoTime});
        });

    });
});
