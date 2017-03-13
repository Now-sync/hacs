import React from "react";
import { connect } from "react-redux";
import YouTube from "react-youtube";

import * as actions from "../actions/videoPlayerActions";

var socket;
var player;

export class VideoPlayer extends React.Component {

    componentWillMount = () => {
        socket = this.props.socket;
    }

    componentDidMount = () => {
        socket.on("play", () => {
            player.playVideo();
        });

        socket.on("pause", () => {
            // TODO: might have to change video location to the timestamp inside this event
            player.pauseVideo();
        });
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.changeVideo();
        e.target.reset();
    }

    handleURLChange = e => {
        this.props.newURLInput(e.target.value);
    }

    handleStateChange = e => {
        // state codes here https://developers.google.com/youtube/iframe_api_reference#Events
        switch (e.data) {
            case YouTube.PlayerState.PLAYING:
                socket.emit("play");
                this.props.play();
                break;
            case YouTube.PlayerState.PAUSED:
                socket.emit("pause", {
                    pausedtime: player.getCurrentTime()
                });
                this.props.pause();
                break;
            case YouTube.PlayerState.BUFFERING:
                this.props.buffer();
                break;
            default:
                return;
        }
    }

    handleReady = e => {
        player = e.target;
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
    socket: React.PropTypes.object
};

const mapDispatchToProps = dispatch => {
    return {
        changeVideo: () => dispatch(actions.changeVideo()),
        newURLInput: url => dispatch(actions.newURLInput(url)),
        play: () => dispatch(actions.play()),
        pause: () => dispatch(actions.pause()),
        buffer: () => dispatch(actions.buffer())
    };
};

const mapStateToProps = state => {
    return state.videoPlayerReducer;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VideoPlayer);
