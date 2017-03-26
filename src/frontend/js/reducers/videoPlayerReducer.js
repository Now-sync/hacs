// from https://gist.github.com/takien/4077195
function youtubeGetId(url) {
    var ID = '';
    url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    } else {
        ID = null;
    }
    return ID;
}

const defaultState = {
    inputURL: null,
    url: null,
    videoId: null,
    playing: false,
    ready: false,
    badPassword: false
};

export default function reducer(state=defaultState, action) {
    switch (action.type) {
        case "newURLInput":
            return Object.assign({}, state, {
                inputURL: action.url
            });
        case "changeVideo":
            return Object.assign({}, state, {
                    url: action.url,
                    videoId: youtubeGetId(action.url)
                });
        case "play":
            return Object.assign({}, state, {
                playing: true,
            });
        case "pause":
            return Object.assign({}, state, {
                playing: false,
            });
        case "setReady":
            return Object.assign({}, state, {
                ready: true
            });
        case "wrongCredentials":
            return Object.assign({}, state, {
                badPassword: true
            });
        default:
            return state;
    }
}
