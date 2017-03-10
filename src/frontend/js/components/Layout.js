import React from "react";
import { connect } from "react-redux";

import { createRooms } from "../actions/roomsActions";

class Layout extends React.Component {
  constructor(props) {
    super(props);
  }

  onsubmit(){
    const url = this.refs.url.value;
    const password = this.refs.password.value;
    this.props.createRoom(url, password);
  }

  render () {
    return (
      <div>
        <h1>HELLO FROM REACT</h1>
        <h2>Room created?: {this.props.rooms.fetched}</h2>
        <form onSubmit= {e => {
          e.preventDefault();
          this.onsubmit();
        }}>
          <input ref="password" type="text" placeholder= "RoomPassword"/>
          <input ref= "url" type="text" placeholder= "VideoUrl"/>
          <button id = "create_room" type="submit">CreateRoom</button>
        </form>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createRoom: (url, password) => dispatch(createRooms(url, password, "CreateRoom"))
  };
};

const mapStateToProps = (state) => {
  return state;
};

const DefaultApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(Layout);

export default DefaultApp;
