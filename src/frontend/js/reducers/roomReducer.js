export default function reducer(state={
    room: {
        roomname: null,
        users: null,
    },
    password: null,
    fetched: false,
    error: null,
    roomStatus: "FETCHING",
    badPassword: false
    }, action) {

    switch (action.type) {
        case "CreateRoom": {
            return Object.assign({}, state, {
                fetched: true,
                room: action.payload,
                password: action.pass
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
        default:
            return state;
    }
}
