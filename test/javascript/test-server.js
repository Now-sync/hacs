
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";  // This is supposedly very bad
var chai = require("chai");
var chaiHttp = require("chai-http");
var server = require("../../src/app.js");
var should = chai.should();

chai.use(chaiHttp);

describe("All server testing", function () {
	describe("Create room", function() {
	  	it("should return a string as room name and create room on /api/createroom/ PUT", function (done) {
			chai.request(server)
				.put("/api/createroom/")
				.send({roomPassword: "password", videoUrl: "random", screenName: "Mallory"})
				.end(function (res) {
					res.should.have.status(200);
					res.body.should.have.property("roomname");
					chai.request(server)
						.get("/api/session/")
						.send({roomname: res.body.roomname, password: "password"})
						.end(function (res2) {
							res2.should.have.status(200);
							res2.body.roomname.should.equal(res.body.roomname);
							done();
					});
			});
		});
	});

});
