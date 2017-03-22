import React from "react";
import Bootstrap from 'bootstrap/dist/css/bootstrap.css';
import Room from "./room";
import VideoPlayer from "./videoPlayer";
import ChatBox from "./chatBox";
import { connect } from "react-redux";
import io from "socket.io-client";
require("../../style/main.css");

var socket = io();


class Layout extends React.Component {

    render () {
        var result = null;

        if (this.props.rooms.fetched){
            result =
            <div className="video_chat_container">
                <VideoPlayer socket={ socket }/>
                <ChatBox/>
            </div>;
        }
        return (
            <div>
                <h1>NOW-SYNC</h1>
                <div className="create_room_container">
                    <Room socket={ socket }/>
                </div>
                { result }
            </div>
        );
    }
}


Layout.propTypes = {
    rooms: React.PropTypes.object,
    videoPlayerReducer: React.PropTypes.object
};

const mapStateToProps = (state) => {
    return state;
};

export default connect(
    mapStateToProps
)(Layout);
