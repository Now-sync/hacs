export function changeVideo(url) {
    return function (dispatch) {
        dispatch({type: "changeVideo", url: url});
    };
}

export function newURLInput(url) {
    return function (dispatch) {
        dispatch({type: "newURLInput", url: url});
    };
}

export function play() {
    return function (dispatch) {
        dispatch({type: "play"});
    };
}

export function pause() {
    return function (dispatch) {
        dispatch({type: "pause"});
    };
}

export function setReady() {
    return function (dispatch) {
        dispatch({type: "setReady"});
    };
}
