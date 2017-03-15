import React from "react";
import { connect } from "react-redux";
import YouTube from "react-youtube";

import * as actions from "../actions/videoPlayerActions";

export class VideoPlayer extends React.Component {
    constructor(props) {
        super(props);
        // for easier unit test stubbing
        this.socket = {};
        this.player = {};
    }

    componentWillMount = () => {
        this.socket = this.props.socket;
    }

    componentDidMount = () => {
        this.socket.on("play", () => {
            this.player.playVideo();
        });

        this.socket.on("pause", () => {
            // TODO: might have to change video location to the timestamp inside this event
            this.player.pauseVideo();
        });

        this.socket.on("videoChange", data => {
            this.props.changeVideo(data.videoUrl);
        });
    }

    handleSubmit = e => {
        e.preventDefault();
        e.target.reset();
        this.props.changeVideoThenEmit();
    }

    handleURLChange = e => {
        this.props.newURLInput(e.target.value);
    }

    handleStateChange = e => {
        // state codes here https://developers.google.com/youtube/iframe_api_reference#Events
        switch (e.data) {
            case YouTube.PlayerState.PLAYING:
                this.socket.emit("play");
                this.props.play();
                break;
            case YouTube.PlayerState.PAUSED:
                this.socket.emit("pause", {
                    pausedtime: this.player.getCurrentTime()
                });
                this.props.pause();
                break;
            case YouTube.PlayerState.BUFFERING:
                this.socket.emit("pause", {
                    pausedtime: this.player.getCurrentTime()
                });
                this.props.buffer();
                break;
            default:
                return;
        }
    }

    handleReady = e => {
        this.player = e.target;
    }

    render() {
        const options = {
            playerVars: {
                autoplay: 1
            }
        };

        return (
            <div>
                <YouTube
                    videoId={this.props.videoId}
                    opts={options}
                    onStateChange={this.handleStateChange}
                    onReady={this.handleReady}
                />
                <form onSubmit={this.handleSubmit}>
                    <input type="text" placeholder="Video URL" onChange={this.handleURLChange} />
                </form>
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
    buffering: React.PropTypes.bool,
    changeVideo: React.PropTypes.func,
    newURLInput: React.PropTypes.func,
    play: React.PropTypes.func,
    pause: React.PropTypes.func,
    buffer: React.PropTypes.func,
    socket: React.PropTypes.object,
    changeVideoThenEmit: React.PropTypes.func
};

const mapDispatchToProps = dispatch => {
    return {
        changeVideo: url => dispatch(actions.changeVideo(url)),
        newURLInput: url => dispatch(actions.newURLInput(url)),
        play: () => dispatch(actions.play()),
        pause: () => dispatch(actions.pause()),
        buffer: () => dispatch(actions.buffer()),
        changeVideoThenEmit: () => dispatch(actions.changeVideo()).then(() => {
            this.socket.emit("videoChange", {
                videoUrl: this.props.url
            });
        })
    };
};

const mapStateToProps = state => {
    return state.videoPlayerReducer;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VideoPlayer);
