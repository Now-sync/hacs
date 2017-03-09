export default function reducer(state={
    room: {
      id: null,
      name: null,
      users: null,
    },
    fetching: false,
    fetched: false,
    error: null,
  }, action) {

    switch (action.type) {
      case "CreateRoom": {
        console.log("HERE YES!");
        return Object.assign({}, state, {fetching: true})
      }
    }

    return state
}
