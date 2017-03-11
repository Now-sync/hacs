// from https://gist.github.com/takien/4077195
function youtubeGetId(url) {
    var ID = '';
    url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    } else {
        ID = url;
    }
    return ID;
}

const defaultState = {
    inputURL: null,
    url: null,
    videoId: null,
    playing: false,
    buffering: false
};

export default function reducer(state=defaultState, action) {
    switch (action.type) {
        case "newURLInput":
            return Object.assign({}, state, {
                inputURL: action.url
            });
        case "changeVideo":
            return Object.assign({}, state, {
                url: state.inputURL,
                videoId: youtubeGetId(state.inputURL)
            });
        case "play":
            return Object.assign({}, state, {
                playing: true,
                buffering: false
            });
        case "pause":
            return Object.assign({}, state, {
                playing: false,
                buffering: false
            });
        case "buffer":
            return Object.assign({}, state, {
                playing: false,
                buffering: true
            });
        default:
            return state;
    }
}
