import React from "react";
import { connect } from "react-redux";
import { Button, Form, FormGroup, ControlLabel, Col, FormControl} from "react-bootstrap";

import { createRoom } from "../actions/roomActions";
var password, url;

export class Room extends React.Component {
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

            // socket.on("join", (data) => {
            //     console.log(data, "response from join");
            // });
        } else if(!this.props.rooms.fetched) {
            socket.disconnect();
        }
    }

    handlePassword = e => {
        password = e.target.value;
    }

    handleVideoUrl = e => {
        url = e.target.value;
    }

    onsubmit(){
        this.props.createRoom(url, password);
    }

    render () {
        return (
            <div>
                <Form horizontal ref="create_room" onSubmit= {e => {
                    e.preventDefault();
                    e.target.reset();
                    this.onsubmit();
                    }}>
                    <FormGroup controlId="formHorizontalPassword">
                        <Col componentClass={ControlLabel} sm={2}>
                            Password
                        </Col>
                        <Col sm={10}>
                            <FormControl type="password" placeholder="RoomPassword" onChange={this.handlePassword}/>
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>
                            VideoUrl
                        </Col>
                        <Col sm={10}>
                            <FormControl ref="url" type="text" placeholder="VideoUrl" onChange={this.handleVideoUrl}/>
                        </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col smOffset={2} sm={10}>
                        <Button bsStyle="primary" type="submit">
                          Create Room
                        </Button>
                      </Col>
                    </FormGroup>
                </Form>
                <hr/>
            </div>
        );
    }
}

Room.propTypes = {
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Room);
