export function changeVideo(url) {
    return function (dispatch) {
        url ? dispatch({type: "changeVideo", url: url}) : dispatch({type: "changeVideo"});
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

export function buffer() {
    return function (dispatch) {
        dispatch({type: "buffer"});
    };
}
