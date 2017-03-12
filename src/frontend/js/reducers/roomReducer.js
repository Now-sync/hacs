export default function reducer(state={
    room: {
        roomname: null,
        users: null,
    },
    fetched: false,
    error: null,
    }, action) {

        switch (action.type) {
            case "CreateRoom": {
            return Object.assign({}, state, {fetched: true, room: action.payload});
        }
        case "CreateRoomError": {
            return Object.assign({}, state, { error: action.payload});
        }
        default:
            return state;
        }
}
