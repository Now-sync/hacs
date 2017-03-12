import React from "react";
import { connect } from "react-redux";
import io from "socket.io-client";
let socket = io();

import { createRoom } from "../actions/roomActions";

class CreateRoom extends React.Component {
    constructor(props) {
    super(props);
    }

    componentDidMount(){
        console.log("HERE, in didMount");
    }

    onsubmit(){
        const url = this.refs.url.value;
        this.refs.url.value = "";

        const password = this.refs.password.value;
        this.refs.password.value = "";

        this.props.createRoom(url, password);
    }

    render () {
        console.log("HERE, render");
        return (
          <div>
            <h2>Room created?: {this.props.rooms.fetched}</h2>
            <form ref="create_room" onSubmit= {e => {
              e.preventDefault();
              this.onsubmit();
            }}>
              <input ref="password" type="text" placeholder="RoomPassword"/>
              <input ref="url" type="text" placeholder="VideoUrl"/>
              <button type="submit">Create Room</button>
            </form>
          </div>
        );
    }
}

CreateRoom.propTypes = {
    createRoom: React.PropTypes.func,
    rooms: React.PropTypes.object
};

const mapDispatchToProps = (dispatch) => {
    return {
        createRoom: (url, password) => dispatch(createRoom(url, password))
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
