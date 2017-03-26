export default function reducer(state={
    room: {
        roomname: null,
        users: null,
    },
    username: null,
    password: null,
    fetched: false,
    error: null,
    roomStatus: "FETCHING",
    badPassword: false,
    joined: false
    }, action) {

    switch (action.type) {
        case "CreateRoom": {
            return Object.assign({}, state, {
                fetched: true,
                room: action.payload,
                password: action.pass,
                roomStatus: "FETCHED"
            });
        }
        case "CreateRoomError": {
            return Object.assign({}, state, {
                fetched: false,
                error: action.payload
            });
        }
        case "JoinRoom": {
            return Object.assign({}, state, {
                fetched: true
            });
        }
        case "UpdateRoomStatus": {
            return Object.assign({}, state, {
                roomStatus: action.status
            });
        }
        case "wrongCredentials": {
            return Object.assign({}, state, {
                badPassword: true
            });
        }
        case "joined": {
            return Object.assign({}, state, {
                joined: true
            });
        }
        case "changeUsername": {
            return Object.assign({}, state, {
                username: action.username
            });
        }
        default:
            return state;
    }
}
