import React, {Component} from "react";
import {bindActionCreators} from "redux";
import { connect } from "react-redux";
//insert css here using require statement

import { createRooms } from "../actions/roomsActions";

class CreateRoom extends Component {
  constructor(props) {
    super(props);
  }

  onsubmit(){
    const url = this.refs.url.value;
    this.refs.url.value = "";
    const password = this.refs.password.value;
    this.refs.password.value = "";
    this.props.createRoom(url, password);
  }

  render () {
    return (
      <div>
        <h2>Room created?: {this.props.rooms.fetched}</h2>
        <form ref = "create_room" onSubmit= {e => {
          e.preventDefault();
          this.onsubmit();
        }}>
          <input ref="password" type="text" placeholder= "RoomPassword"/>
          <input ref= "url" type="text" placeholder= "VideoUrl"/>
          <button type="submit">Create Room</button>
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

const Room = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateRoom);

export default Room;
