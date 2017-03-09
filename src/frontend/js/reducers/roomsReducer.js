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
      case "FETCH_USER": {
        return Object.assign({}, state, {fetching: true})
      }
    }

    return state
}
