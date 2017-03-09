export default function reducer(state={
    room: {
      id: null,
      name: null,
      users: null,
    },
    fetching: false,
    fetched: "no",
    error: null,
  }, action) {

    switch (action.type) {
      case "CreateRoom": {
        console.log("HERE YES!", action.payload);
        return Object.assign({}, state, {fetched: "yes"});
      }
      case "CreateRoomError": {
        console.log("Error!");
        return Object.assign({}, state, {fetched: "no", error: action.payload});
      }
      default:
        return state;
    }
}
