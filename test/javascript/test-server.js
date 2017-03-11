process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";  // This is supposedly very bad
process.env.NODE_ENV = "test";
var chai = require("chai");
var chaiHttp = require("chai-http");
var server = require("../../src/app.js");
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

        it("should return a status code 200", function (done) {
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: "random"})
                .end(function (res) {
                    res.should.have.status(200);
                    done();
                });
        });

        it("should have a return with property roomname", function (done) {
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: "random"})
                .end(function (res) {
                    res.body.should.have.property("roomname");
                    done();
                });
        });

        /* Comprehensive test */
        it("should return a string as room name and room should exist", function (done) {
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: "random"})
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
        before(function (done){
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: "random"})
                .end(function (res) {
                    roomname = res.body.roomname;
                    done();
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
                .send({roomPassword: "password", videoUrl: "random"})
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
        before(function (done){
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: "random"})
                .end(function (res) {
                    roomname = res.body.roomname;
                    done();
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
                .send({roomPassword: "password", videoUrl: "random"})
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

    describe("Test emit video change", function() {
        var personA, personB, personC;
        var videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        var newVideo = "https://www.youtube.com/watch?v=ZyhrYis509A";
        var roomname;

        beforeEach(function (done){
            chai.request(server)
                .put("/api/createroom/")
                .send({roomPassword: "password", videoUrl: videoUrl})
                .end(function (res) {
                    roomname = res.body.roomname;
                    

                    personA = io.connect(socketUrl, options);
                    personB = io.connect(socketUrl, options);
                    personC = io.connect(socketUrl, options);
                    /* This setup is necessary because when joining a room a user recieves a
                     videoChange signal immeadiately. This can mess with later test cases.*/
                    var countA = 0, countB = 0, countC = 0, expect = 1;
                    personA.on("connect", function() {
                        personA.emit("join", {roomname: roomname, roompass: "password", username: "personA"});
                        personB.on("connect", function() {
                            personB.emit("join", {roomname: roomname, roompass: "password", username: "personB"});
                            personC.on("connect", function() {
                                personC.emit("join", {roomname: roomname, roompass: "password", username: "personC"});
                                personC.once("videoChange", function(){
                                    countC++;
                                    if (countA === expect && countB === expect && countC === expect) done();
                                });
                            });
                            personB.once("videoChange", function(){
                                countB++;
                                if (countA === expect && countB === expect && countC === expect) done();
                            });
                        });
                        personA.once("videoChange", function(){
                            countA++;
                            if (countA === expect && countB === expect && countC === expect) done();
                        });
                    });
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

        it("should broadcast video change to all users in the same room", function (done) {
            var countA = 0, countB = 0, countC = 0, expect = 1;

            personA.on("videoChange", function () {
                countA++;
                if (countA === expect && countB === expect && countC === expect) {
                    done();
                }
            });

            personB.on("videoChange", function () {
                countB++;
                if (countA === expect && countB === expect && countC === expect) {
                    done();
                }
            });

            personC.on("videoChange", function () {
                countC++;
                if (countA === expect && countB === expect && countC === expect) {
                    done();
                }
            });

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
            });
            personA.emit("join", {roomname: roomname, roompass: "password", username: "personA"});
        });
    });
});