## Server REST API

1. Create a room with password and video

    - Request PUT /api/createroom/
        - CONTENT-TYPE: application/json
        - BODY:
            - roomPassword - string
            - videoUrl - string
    - Response 200
        - CONTENT-TYPE: application/json
        - BODY: roomname - string
    - Response 400
        - No room password given
    - Response 500
        - Database error

##Server Sockets

    Note: [null] the value of the key-value pair can be 'null'.

    List of current possible signals the server might send
        - "userLeft" -> A user has left the room you are in.
            Returns {username: <name of user that left>}
        - "userJoined" -> A user has joined the room you are in.
            Returns {username: <name of user that joined>}
        - "pause" -> A user in the room has signalled pause into the room.
            Returns {pausedtime: <paused time>, username: <name of user that signalled pause>}
        - "play" -> A user in the room has signalled play into the room.
            Returns {username: <name of user that signalled the pause>}
        - "videoChange" -> A user has changed the video of the room
            Returns {videoUrl: <Url of video>, username: <name of user that changed the video [null]>, skipTo: <time in video [null]>}

    Note: [optional] sending no data will not cause problems.

    List of signals that the server will accept and handle
        - "join"
            Send: {roomname: <name of room>, roompass: <password of room>, username: <name to display [optional]>}
        - "pause"
            Send: {pausedtime: <time user paused at>}
        - "play"
            Send: nothing (I mean literally nothing, do not give a second argument in emit())
        - "videoChange"
            Send: {videoUrl: <Url of video>}

    JOIN ROOM
        - my_socket.emit("join", {roomname: "pjifpadfj", roompass: "hunter2"});
        Expect two responses:
            - "userJoined" - The user who joined, it this case yourself.
            - "videoChange" - Server will send video Url upon join

    Signal Play into room
        - my_socket.emit("play");
        Expect one reponse:
            - "play" - The play the user emitted

    Signal Pause into room
        - my_socket.emit("pause", <paused time>);
        Expect one response:
            - "pause" - The pause the user emitted

    Changing room video
        - my_socket.emit("videoChange", {videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"});
        Expect one response:
            - "videoChange" - The video change the user emitted