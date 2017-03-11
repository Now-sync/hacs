import React from "react";
import { connect } from "react-redux";
import YouTube from "react-youtube";

import { changeVideo, newURLInput } from "../actions/videoPlayerActions";

class VideoPlayer extends React.Component {
    handleSubmit(e) {
        e.preventDefault();
        this.props.changeVideo();
    }

    handleURLChange(e) {
        this.props.newURLInput(e.target.value);
    }

    render() {
        return (
            <div>
                <YouTube videoId={this.props.videoId} />
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
    newURLInput: React.PropTypes.func
};

const mapDispatchToProps = dispatch => {
    return {
        changeVideo: () => dispatch(changeVideo()),
        newURLInput: url => dispatch(newURLInput(url))
    };
};

const mapStateToProps = state => {
    return state;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VideoPlayer);