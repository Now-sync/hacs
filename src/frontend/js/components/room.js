import React from "react";
import { connect } from "react-redux";
import { Button, Form, FormGroup, ControlLabel, Col, FormControl} from "react-bootstrap";

import { createRoom } from "../actions/roomActions";
require("../../style/main.css");
var password, url;

export class Room extends React.Component {
    constructor(props) {
        super(props);
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
        // the server only sends back "Validation Error", and no other errors will happen here anyway
        var error = this.props.rooms.error ? <h2>Invalid YouTube URL</h2> : null;
        return (
            <div>
                <Col smOffset={4} sm={4} className="create_room_container" >
                    <Form horizontal onSubmit= {e => {
                        e.preventDefault();
                        e.target.reset();
                        this.onsubmit();
                        }}>
                        <FormGroup controlId="formHorizontalPassword">
                            <Col componentClass={ControlLabel} sm={2}>
                                Password
                            </Col>
                            <Col sm={10}>
                                <FormControl type="password" placeholder="Room Password" onChange={this.handlePassword}/>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={2}>
                                VideoUrl
                            </Col>
                            <Col sm={10}>
                                <FormControl ref="url" type="text" placeholder="Video Url" onChange={this.handleVideoUrl}/>
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
                    { error }
                </Col>
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
    };
};

const mapStateToProps = (state) => {
    return state;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Room);
