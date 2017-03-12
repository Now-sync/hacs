import React from "react";
import { connect } from "react-redux";


import { createRoom } from "../actions/roomActions";

class CreateRoom extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate(){
        var socket = this.props.socket;
        if(this.props.rooms.fetched && this.props.videoPlayerReducer.inputURL === null) {
            socket.connect();
            socket.emit("join",{
                roomname: this.props.rooms.room.roomname,
                roompass: this.props.rooms.password
            });
        } else if(!this.props.rooms.fetched) {
            socket.disconnect();
        }
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
                <form ref="create_room" onSubmit= {e => {
                    e.preventDefault();
                    this.onsubmit();
                    }}>
                    <input ref="password" type="text" placeholder="RoomPassword"/>
                    <input ref="url" type="text" placeholder="VideoUrl"/>
                    <button type="submit">Create Room</button>
                </form>
                <hr/>
            </div>
        );
    }
}

CreateRoom.propTypes = {
    createRoom: React.PropTypes.func,
    rooms: React.PropTypes.object,
    videoPlayerReducer: React.PropTypes.object,
    socket: React.PropTypes.object
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
