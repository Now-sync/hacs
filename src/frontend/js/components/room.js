import React from "react";
import { connect } from "react-redux";

import { createRoom, joinRoom } from "../actions/roomActions";
import { newURLInput, changeVideo } from "../actions/videoPlayerActions";
var socket;

export class Room extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount(){
        socket = this.props.socket;
    }

    componentDidUpdate(){
        if(this.props.rooms.fetched && this.props.videoPlayerReducer.inputURL === null) {
            socket.connect();

            socket.on("videoChange", (data) => {
                this.props.newURLInput(data.videoUrl);
                this.props.changeVideo(data.videoUrl);
            });

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

    generateUrl = e => {
        e.preventDefault();
        var link = this.props.rooms.room.roomname;
        this.refs.link.value = link;
    }

    joinRoom = e => {
        e.preventDefault();
        const roomName = this.refs.getRoomName.value;
        const pass = this.refs.getPass.value;
        this.props.rooms.room.roomname = roomName;
        this.props.rooms.password = pass;
        console.log(roomName, " ",  pass, "GOT HERE!!");
        socket.connect();

        socket.on("videoChange", (data) => {
            this.props.newURLInput(data.videoUrl);
            this.props.changeVideo(data.videoUrl);
        });

        socket.emit("join",{
            roomname: this.props.rooms.room.roomname,
            roompass: this.props.rooms.password
        });
        // this.props.joinRoom2(roomName);
    }


    render () {
        return (
            <div>
                <form onSubmit={this.joinRoom}>
                    <input ref="getRoomName" type="text" placeholder="Enter Roomname"/>
                    <input ref="getPass" type="text" placeholder="Enter Password"/>
                    <button type="submit">Join Room</button>
                </form>
                <hr/>
                <form ref="create_room" onSubmit= {e => {
                    e.preventDefault();
                    this.onsubmit();
                    }}>
                    <input ref="password" type="text" placeholder="RoomPassword"/>
                    <input ref="url" type="text" placeholder="VideoUrl"/>
                    <button type="submit">Create Room</button>
                    </form>
                <hr/>
                <form onSubmit={this.generateUrl}>
                    <input ref="link" type="text" placeholder="Roomname"/>
                    <button type="submit">Generate Link to Share</button>
                </form>
                <hr/>
            </div>
        );
    }
}

Room.propTypes = {
    createRoom: React.PropTypes.func,
    rooms: React.PropTypes.object,
    videoPlayerReducer: React.PropTypes.object,
    changeVideo: React.PropTypes.func,
    socket: React.PropTypes.object,
    location: React.PropTypes.string,
    joinRoom2: React.PropTypes.func,
    newURLInput: React.PropTypes.func
};

const mapDispatchToProps = (dispatch) => {
    return {
        createRoom: (url, password) => dispatch(createRoom(url, password)),
        newURLInput: url => dispatch(newURLInput(url)),
        changeVideo: (url) => dispatch(changeVideo(url)),
        joinRoom2: (roomName) => dispatch(joinRoom(roomName))
    };
};

const mapStateToProps = (state) => {
    return state;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Room);
