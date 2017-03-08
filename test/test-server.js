var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../src/app.js');
var should = chai.should();

chai.use(chaiHttp);


describe("Blobs", function() {
  it("should return a string as room name and create room on /api/createroom/ PUT");
});

it("should return a string as room name and create room on /api/createroom/ PUT", function (done) {
	chai.request(server)
		.put("/api/createroom/")
		.send({roomPassword: "password", videourl: "random", screenName: "Mallory"})
		.end(function (err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a("object");
			res.body.should.have.property("roomname");
			chai.request(server)
				.get("/api/session/")
				.send({roomname: res.body.roomname, password: "password"})
				.end(function (err2, res2) {
					res2.should.have.status(200);
					res2.body.should.be.a('object');
					res2.body.should.have.property("roomname");
					res2.body.roomname.should.equal(res.body.roomname);
					done();
				});
		});
});