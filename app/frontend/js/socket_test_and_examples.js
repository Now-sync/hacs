var _test_ = (function(model){
	"use strict";

	var _test_ = {};

	document.addEventListener("eventPlay", function(e){
		console.log("Event play recieved");
	});

	document.addEventListener("eventPause", function(e){
		console.log(e.detail.pauseTime);
	});

	document.addEventListener("eventUserJoinedRoom", function(e){
		console.log(e.detail.message);
	});

	window.onload = function(){
		//model.connect();
		model.joinRoom("yellow_sub");
		model.signalPlay();
		model.signalPause("69:69");
	};



	return _test_;
}(model));