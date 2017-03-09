export default function reducer(state={
    room: {
      id: null,
      name: null,
      users: null,
    },
    fetching: false,
    fetched: false,
    counter: 0,
    error: null,
  }, action) {

    switch (action.type) {
      case "CreateRoom": {
        console.log("HERE YES!");
        return Object.assign({}, state, {fetching: true});
      }
      case "CreateRoomError": {
        console.log("Error!");
      }
      case "Add":
        console.log("ADD!!", state);
        return Object.assign({}, state, {counter: state.counter + 1});
      default:
        return state;
    }
}
