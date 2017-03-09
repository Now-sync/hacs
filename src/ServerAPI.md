## Server REST API

1. Create a room with password and video

	- Request PUT /api/createroom/
		CONTENT-TYPE: application/json
		BODY: 	roomPassword - string
				videoUrl - string
	- Response 200
		CONTENT-TYPE: application/json
		BODY: roomname - string
	- Response 400
		No room password given
	- Response 500
		Database error

##Server Sockets

	## List of current possible signals the server might send
		- "userLeft" A user has left the room you are in. Returns {username: <name of user that left>}
		- "userJoined" A user has joined the room you are in. Returns {username: <name of user that joined>}
		- "pause" A user in the room has signalled pause into the room. Returns {pausedtime: <paused time>, username: <name of user that signalled pause>}
		- "play" A user in the room has signalled play into the room. Returns {username: <name of user that signalled the pause>}

	## List of signals that the server will accept and handle
		- "join"
		- "pause"
		- "play"


	## JOIN ROOM
		- my_socket.emit("join", {roomname: <room_name_data>, roompass: <room_pass_data>});

		Expect one response:
			- "userJoined"

	## Signal Play into room
		- my_socket.emit("play");
		Expect one reponse:
			- "play"

	## Signal Pause into room
		- my_socket.emit("pause", <paused time>);
		Expect one response:
			- "pause"