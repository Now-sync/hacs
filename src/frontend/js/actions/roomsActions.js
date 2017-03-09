import axios from "axios";

export function createRooms() {
  return function(dispatch) {
    axios.put("http://localhost:3000/api/createroom")
      .then((response) => {
        dispatch({type: "CreateRoom", payload: response.data})
      })
      .catch((err) => {
        dispatch({type: "CreateRoomError", payload: err})
      })
  }
}

export function counter(){
  return {type: "Add"}
}
