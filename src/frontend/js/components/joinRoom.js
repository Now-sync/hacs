import React from "react";
import { connect } from "react-redux";
import { Form, FormGroup, ControlLabel, Col, FormControl} from "react-bootstrap";

import {  joinRoom } from "../actions/roomActions";
import { newURLInput, changeVideo } from "../actions/videoPlayerActions";
require("../../style/main.css");

var password;

export class Join extends React.Component {
    constructor(props) {
        super(props);
    }

    handlePassword = e => {
        password = e.target.value;
    }

    joinRoom = e => {
        e.preventDefault();
        e.target.reset();
        var roomname = window.location.search;
        this.props.rooms.room.roomname = roomname.substring(roomname.indexOf("roomname")+9, roomname.length);
        this.props.rooms.password = password;

        this.props.joinRoomActual(this.props.rooms.room.roomname);
    }

    render () {
        return (
            <div>
                <Col smOffset={4} sm={4} className="create_room_container" >
                    <Form horizontal onSubmit={this.joinRoom}>
                        <FormGroup controlId="formHorizontalVideoChange">
                            <Col componentClass={ControlLabel} sm={2}>
                                Password
                            </Col>
                            <Col sm={10}>
                                <FormControl type="password" placeholder="Press Enter To Join Room" onChange={this.handlePassword}/>
                            </Col>
                        </FormGroup>
                    </Form>
                </Col>
            </div>
        );
    }
}

Join.propTypes = {
    rooms: React.PropTypes.object,
    joinRoomActual: React.PropTypes.func
};
const mapDispatchToProps = (dispatch) => {
    return {
        newURLInput: url => dispatch(newURLInput(url)),
        changeVideo: (url) => dispatch(changeVideo(url)),
        joinRoomActual: (roomName) => dispatch(joinRoom(roomName))
    };
};

const mapStateToProps = (state) => {
    return state;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Join);
