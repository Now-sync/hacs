export default function reducer(state={
    room: {
        roomname: null,
        users: null,
    },
    password: null,
    fetched: false,
    error: null,
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
        default:
            return state;
        }
}
