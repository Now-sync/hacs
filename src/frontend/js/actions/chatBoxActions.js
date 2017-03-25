export function enterMessage(content) {
    return function (dispatch) {
        dispatch({type: "enterMessage", payload: content});
    };
}

export function receivedMessage(content) {
    return function (dispatch) {
        dispatch({type: "receivedMessage", payload: content});
    };
}

export function updateChatBox(message) {
    return function (dispatch) {
        dispatch({type: "updateChatBox", payload: message});
    };
}
