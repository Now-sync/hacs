import React from "react";
import Room from "./room";
import VideoPlayer from "./videoPlayer";
import Join from "./joinRoom";
import ChatBox from "./chatBox";
import { connect } from "react-redux";
import { Col, Row } from "react-bootstrap";
import io from "socket.io-client";
require("../../style/main.css");

import { wrongCredentials, joined } from "../actions/roomActions";
import { newURLInput, changeVideo } from "../actions/videoPlayerActions";


var socket = io();
var result;
var tryToJoin = false;

class Layout extends React.Component {

    componentWillMount(){
        if (window.location.search === "" ){
            this.props.history.push("/");
            result =
                <div>
                    <Room socket={ socket } connectSocket={this.joinRoom}/>
                </div>;

        } else {
            result =
                <div>
                    <Join connectSocket={this.joinRoom}/>
                </div>;
        }
    }

    componentDidMount() {
        socket.on("joinError", () => {
            this.props.wrongCredentials();
            socket.disconnect();
        });

        socket.on("joinSuccess", () => {
            this.props.joined();
        });
    }

    componentWillReceiveProps(nextProps){
        // if (!this.props.videoPlayerReducer.ready && nextProps.videoPlayerReducer.ready){
        //     socket.connect();

        //     socket.emit("join",{
        //         roomname: nextProps.rooms.room.roomname,
        //         roompass: nextProps.rooms.password,
        //         username: nextProps.rooms.username
        //     });
        // }
        if (!this.props.rooms.fetched && nextProps.rooms.fetched) {
            tryToJoin = true;
        }
    }

    componentDidUpdate(){
        if (tryToJoin) {
            this.joinRoom();
            tryToJoin = false;
        }
        if(this.props.rooms.fetched && this.props.videoPlayerReducer.inputURL === null) {

            socket.on("videoChange", (data) => {
                this.props.newURLInput(data.videoUrl);
                this.props.changeVideo(data.videoUrl);
            });

        } else if(!this.props.rooms.fetched) {
            socket.disconnect();
        }
    }

    joinRoom = () => {
        socket.connect();
        socket.emit("join", {
            roomname: this.props.rooms.room.roomname,
            roompass: this.props.rooms.password,
            username: this.props.rooms.username
        });
    }

    render() {
        if (this.props.rooms.fetched) {
            if (this.props.rooms.joined) {
                result =
                    <Col sm={12}>
                        <Row>
                            <Col sm={10}>
                                <div className="video_container">
                                    <VideoPlayer history={this.props.history} socket={ socket } room={this.props.rooms.room}/>
                                </div>
                            </Col>
                            <Col sm={2}>
                                <div className="chat_container">
                                    <ChatBox />
                                </div>
                            </Col>
                        </Row>
                    </Col>;
            } else {
                result = (
                    <div>
                        <Join connectSocket={this.joinRoom}/>
                    </div>
                );
            }
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
    wrongCredentials: React.PropTypes.func,
    joined: React.PropTypes.func
};


const mapDispatchToProps = (dispatch) => {
    return {
        newURLInput: url => dispatch(newURLInput(url)),
        changeVideo: url => dispatch(changeVideo(url)),
        wrongCredentials: () => dispatch(wrongCredentials()),
        joined: () => dispatch(joined())
    };
};

const mapStateToProps = (state) => {
    return state;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Layout);
