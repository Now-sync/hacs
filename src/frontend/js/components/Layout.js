import React from "react";
import Room from "./room";
import VideoPlayer from "./videoPlayer";
import ChatBox from "./chatBox";
import { connect } from "react-redux";
import io from "socket.io-client";
require("../../style/main.css");

var socket = io();


class Layout extends React.Component {

    render () {
        var result =
            <div>
                <Room socket={ socket }/>
            </div>;

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
