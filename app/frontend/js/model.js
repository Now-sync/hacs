var model = (function(){
	"use strict";

	var socket = io("https://localhost:3000");
	var model = {};

	var doAjax = function (method, url, body, json, callback){
		// --- This following function is by Thierry Sans from lab 5
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(e){
            switch(this.readyState){
                 case (XMLHttpRequest.DONE):
                    if (this.status === 200) {
                        if (json) return callback(null, JSON.parse(this.responseText));
                        return callback(null, this.responseText);
                    }else{
                        return callback(this.responseText, null);
                    }
            }
        };
        xhttp.open(method, url, true);
        if (json) xhttp.setRequestHeader('Content-Type', 'application/json');

        if (json) {
        	xhttp.send((body)? JSON.stringify(body) : null);  
        } else {
        	xhttp.send(body);
        }
        
    };


	/* Socket listener */
	socket.on("connect", function(){
		document.dispatchEvent(new CustomEvent("serverConnectSuccess"));
	});

	socket.on("play", function(data){
		document.dispatchEvent(new CustomEvent("eventPlay", {detail:data}));
	});
	socket.on("pause", function(data){
		document.dispatchEvent(new CustomEvent("eventPause", {
			detail:data
		}));
	});

	socket.on("userJoined", function(data) {
		document.dispatchEvent(new CustomEvent("eventUserJoinedRoom", {
			detail:data
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

	model.joinRoom = function(room, user){
		if (typeof user === "undefined") user = null;
		var data = {};
		data.roomname = room;
		data.username = user;
		socket.emit("join", data);
	};

	model.signalPlay = function(){
		socket.emit("play");
	};

	model.signalPause = function(pauseTime){
		socket.emit("pause", pauseTime);
	};

	return model;
}());
