(function(model){
	"use strict";

	document.addEventListener("eventPlay", function (e) {
		console.log("User:", e.detail.username, "has signaled Play.");
	});

	document.addEventListener("eventPause", function (e) {
		var pausedtime = e.detail.pausedtime;
		var username = e.detail.username;
		console.log("User:", username, "has signaled paused at time", pausedtime);
	});

	document.addEventListener("eventUserJoinedRoom", function (e) {
		var username = e.detail.username;
		console.log("User:", username, "has joined the room.");
	});

	window.onload = function () {
		//model.connect();
		model.joinRoom("yellow_sub");
		model.signalPlay();
		model.signalPause("69:69");
	};


}(model));