import React from "react";
import { connect } from "react-redux";
import YouTube from "react-youtube";
import { Form, FormGroup, ControlLabel, Col, FormControl} from "react-bootstrap";

import * as actions from "../actions/videoPlayerActions";

var dontpause = false;

export class VideoPlayer extends React.Component {
    constructor(props) {
        super(props);
        // for easier unit test stubbing
        this.socket = {};
        this.player = {};
    }

    componentWillMount = () => {
        this.props.history.push("/room/?roomname="+ this.props.room.roomname);
        this.socket = this.props.socket;
    }

    handleSubmit = e => {
        e.preventDefault();
        e.target.reset();
        this.socket.emit("videoChange", {
            videoUrl: this.props.inputURL
        });
    }

    handleURLChange = e => {
        this.props.newURLInput(e.target.value);
    }

    handleStateChange = e => {
        // state codes here https://developers.google.com/youtube/iframe_api_reference#Events
        switch (e.data) {
            case YouTube.PlayerState.PLAYING:
                this.socket.emit("play", {
                    playtime: this.player.getCurrentTime()
                });
                this.props.play();
                break;
            case YouTube.PlayerState.PAUSED:
                if (!dontpause) {
                    this.socket.emit("pause", {
                        pausedtime: this.player.getCurrentTime()
                    });
                    this.props.pause();
                } else {
                    dontpause = false;
                }
                break;
            default:
                return;
        }
    }

    handleReady = e => {
        this.player = e.target;
        this.props.setReady();

        this.socket.on("play", data => {
            this.player.seekTo(data.playtime, true);
            this.player.playVideo();
        });

        this.socket.on("pause", data => {
            this.player.pauseVideo();
            this.player.seekTo(data.pausedtime, true);
            dontpause = true;
        });

        this.socket.on("videoChange", data => {
            this.props.changeVideo(data.videoUrl);
        });

        this.socket.on("requestTime", () => {
            this.socket.emit("currentTime", {
                currTime: this.player.getCurrentTime()
            });
        });

        this.socket.on("skipTo", data => {
            this.player.seekTo(data.skipToTime, true);
        });

        this.socket.emit("requestVideoInfo");
    }

    render() {
        const options = {
            playerVars: {
                autoplay: 1
            }
        };

        return (
            <div>
                <Form horizontal onSubmit={this.handleSubmit}>
                    <FormGroup controlId="formHorizontalVideoChange">
                        <Col componentClass={ControlLabel} sm={1}>
                            Video Change
                        </Col>
                        <Col sm={6}>
                            <FormControl type="text" placeholder="Press Enter To Change Video" onChange={this.handleURLChange}/>
                        </Col>
                    </FormGroup>
                </Form>
                <Col sm={12}>
                    <YouTube
                        videoId={this.props.videoId}
                        opts={options}
                        onStateChange={this.handleStateChange}
                        onReady={this.handleReady}
                    />
                </Col>
            </div>
        );
    }
}

VideoPlayer.propTypes = {
    inputURL: React.PropTypes.string,
    url: React.PropTypes.string,
    videoId: React.PropTypes.string,
    playing: React.PropTypes.bool,
    paused: React.PropTypes.bool,
    changeVideo: React.PropTypes.func,
    newURLInput: React.PropTypes.func,
    play: React.PropTypes.func,
    pause: React.PropTypes.func,
    socket: React.PropTypes.object,
    history: React.PropTypes.object,
    room: React.PropTypes.object,
    changeVideoThenEmit: React.PropTypes.func,
    setReady: React.PropTypes.func
};

const mapDispatchToProps = dispatch => {
    return {
        changeVideo: url => dispatch(actions.changeVideo(url)),
        newURLInput: url => dispatch(actions.newURLInput(url)),
        play: () => dispatch(actions.play()),
        pause: () => dispatch(actions.pause()),
        setReady: () => dispatch(actions.setReady())
    };
};

const mapStateToProps = state => {
    return state.videoPlayerReducer;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VideoPlayer);
