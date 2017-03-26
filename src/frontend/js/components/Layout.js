import React from "react";
import Room from "./room";
import VideoPlayer from "./videoPlayer";
import Join from "./joinRoom";
import ChatBox from "./chatBox";
import { connect } from "react-redux";
import { Col, Row } from "react-bootstrap";
import io from "socket.io-client";
require("../../style/main.css");

import { newURLInput, changeVideo, requested } from "../actions/videoPlayerActions";


var socket = io();
var result;


class Layout extends React.Component {

    componentWillMount = () => {
        if (window.location.search === "" ){
            this.props.history.push("/");
            result =
                <div>
                    <Room socket={ socket }/>
                </div>;

        } else {
            result =
                <div>
                    <Join />
                </div>;
        }
    }
    componentWillReceiveProps = (nextProps) => {
        if (!this.props.videoPlayerReducer.ready && nextProps.videoPlayerReducer.ready){
            socket.connect();

            socket.emit("join",{
                roomname: nextProps.rooms.room.roomname,
                roompass: nextProps.rooms.password
            });
        }
    }

    componentDidUpdate = () => {
        if(this.props.rooms.fetched && this.props.videoPlayerReducer.inputURL === null) {

            socket.on("videoChange", (data) => {
                this.props.newURLInput(data.videoUrl);
                this.props.changeVideo(data.videoUrl);
            });

        } else if(!this.props.rooms.fetched) {
            socket.disconnect();
        }
    }

    render () {
        if (this.props.rooms.fetched){
            result =
                <Col sm={12}>
                    <Row>
                        <Col sm={10}>
                            <div className="video_container">
                                <VideoPlayer ref={(video) => { this.video = video; }} history={ this.props.history } socket={ socket } room={ this.props.rooms.room }/>
                            </div>
                        </Col>
                        <Col sm={2}>
                            <div className="chat_container">
                                <ChatBox  socket={ socket } video={ this.props.videoPlayerReducer }/>
                            </div>
                        </Col>
                    </Row>
                </Col>;
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
    videoPlayerReducer: React.PropTypes.object,
    history: React.PropTypes.object,
    location: React.PropTypes.object,
    newURLInput: React.PropTypes.func,
    changeVideo: React.PropTypes.func,
    requested: React.PropTypes.func
};


const mapDispatchToProps = (dispatch) => {
    return {
        newURLInput: url => dispatch(newURLInput(url)),
        changeVideo: url => dispatch(changeVideo(url)),
        requested: value => dispatch(requested(value))
    };
};

const mapStateToProps = (state) => {
    return state;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Layout);
