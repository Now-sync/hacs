import React from "react";
import { connect } from "react-redux";

import { createRoom } from "../actions/roomActions";
import { newURLInput, changeVideo } from "../actions/videoPlayerActions";

export class Room extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate(){
        var socket = this.props.socket;
        if(this.props.rooms.fetched && this.props.videoPlayerReducer.inputURL === null) {
            socket.connect();

            socket.on("videoChange", (data) => {
                this.props.newURLInput(data.videoUrl);
                this.props.changeVideo();
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
        var link = window.location.origin + "/room/" + this.props.rooms.room.roomname;
        this.refs.link.value = link;
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
                <form onSubmit={this.generateUrl}>
                    <input ref="link" type="text" placeholder="JoinLink"/>
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
    newURLInput: React.PropTypes.func
};

const mapDispatchToProps = (dispatch) => {
    return {
        createRoom: (url, password) => dispatch(createRoom(url, password)),
        newURLInput: url => dispatch(newURLInput(url)),
        changeVideo: () => dispatch(changeVideo()),
    };
};

const mapStateToProps = (state) => {
    return state;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Room);
