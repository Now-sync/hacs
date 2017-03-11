export function changeVideo() {
    return function (dispatch) {
        dispatch({type: "changeVideo"});
    };
}

export function newURLInput(url) {
    return function (dispatch) {
        dispatch({type: "newURLInput", url: url});
    };
}
