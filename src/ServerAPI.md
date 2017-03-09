

## Server RESTful API

##1. Create a room with password and video

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