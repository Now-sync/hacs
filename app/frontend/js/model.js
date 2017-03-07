var model = (function(){
	"use strict";

	var socket = io("https://localhost:3000");
	var model = {};

	/* Socket listener */
	socket.on("connect", function(){
		document.dispatchEvent(new CustomEvent("serverConnectSuccess"));
	});

	socket.on("play", function(data){
		document.dispatchEvent(new CustomEvent("eventPlay", {}));
	});
	socket.on("pause", function(data){
		document.dispatchEvent(new CustomEvent("eventPause", {
			detail:{pauseTime:data}
		}));
	});

	socket.on("userJoined", function(msg) {
		document.dispatchEvent(new CustomEvent("eventUserJoinedRoom", {
			detail:{message:msg}
		}));
	});

	socket.on("disconnect", function(){
		document.dispatchEvent(new CustomEvent("socketDisconnected"));
	});


	/* Socket signal */
	model.connect = function(callback){
		socket = io("https://localhost:3000");
		callback();
	};

	model.joinRoom = function(roomname){
		socket.emit("join", roomname);
	};

	model.signalPlay = function(){
		socket.emit("play");
	};

	model.signalPause = function(pauseTime){
		socket.emit("pause", pauseTime);
	};

	return model;
}());
