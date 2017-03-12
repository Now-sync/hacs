export function connectSocket() {
    return function(dispatch) {
        dispatch({type: "Connect"});
    };
}

export function joinSocket(roomName, password, userName=""){
    return function(dispatch) {
        dispatch({type: "join", payload: {
            roomname: roomName,
            roompass: password,
            username: userName
        }});
    };
}

export function playSocket(){
    return function(dispatch) {
        dispatch({type: "play"});
    };
}

export function pauseSocket(pausedTime){
    return function(dispatch){
        dispatch({type: "pause", payload: pausedTime});
    };
}

export function videoChange(url) {
    return function(dispatch) {
        dispatch({type: "videoChange", payload: url});
    };
}
