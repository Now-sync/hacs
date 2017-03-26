import axios from "axios";

export function createRoom(url, password) {
    return function(dispatch) {
        axios.put("/api/createroom", {
            roomPassword: password,
            videoUrl: url
        })
        .then((response) => {
            dispatch({type: "CreateRoom", payload: response.data, pass: password });
        })
        .catch((err) => {
            dispatch({type: "CreateRoomError", payload: err});
        });
    };
}

export function joinRoom(roomName) {
    return function(dispatch) {
        axios.get(`/api/room/${roomName}`)
        .then ((response) => {
            dispatch({type: "JoinRoom", payload:response.data});
        });
        // .catch((err) => {
        //     // dispatch({type:})
        // });
    };
}

export function checkRoomExistence(roomName) {
    return function(dispatch) {
        axios.get(`/api/room/${roomName}`)
        .then(response => {
            if (response.status === 200) {
                dispatch({type: "UpdateRoomStatus", status: "VALID"});
            }
        })
        .catch(() => {
            dispatch({type: "UpdateRoomStatus", status: "INVALID"});
        });
    };
}

export function wrongCredentials() {
    return function (dispatch) {
        dispatch({type: "wrongCredentials"});
    };
}

export function joined() {
    return function (dispatch) {
        dispatch({type: "joined"});
    };
}

export function changeUsername(username) {
    return function (dispatch) {
        dispatch({type: "changeUsername", username: username});
    };
}
