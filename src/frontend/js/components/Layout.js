import React from "react";
import Room from "./room";
import VideoPlayer from "./videoPlayer";
import ChatBox from "./chatBox";
import { connect } from "react-redux";
import { Col, Row } from "react-bootstrap";
import io from "socket.io-client";
require("../../style/main.css");

var socket = io();


class Layout extends React.Component {

    componentWillMount(){
        this.props.history.push("/");
    }

    render () {
        var result =
            <div>
                <Room socket={ socket }/>
            </div>;

        if (this.props.rooms.fetched){
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
    location: React.PropTypes.object
};

const mapStateToProps = (state) => {
    return state;
};

export default connect(
    mapStateToProps
)(Layout);
