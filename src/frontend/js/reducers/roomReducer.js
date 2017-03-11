export default function reducer(state={
    room: {
        roomname: null,
        users: null,
    },
    fetching: false,
    fetched: "no",
    error: null,
    }, action) {

        switch (action.type) {
            case "CreateRoom": {
            return Object.assign({}, state, {fetched: "yes", room: action.payload});
        }
        case "CreateRoomError": {
            return Object.assign({}, state, {fetched: "no", error: action.payload});
        }
        default:
            return state;
        }
}
