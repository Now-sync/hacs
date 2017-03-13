import React from "react";
import Room from "./room";
import VideoPlayer from "./videoPlayer";
import { connect } from "react-redux";
import io from "socket.io-client";

var socket = io();
//insert css here using require statement


class Layout extends React.Component {

    componentWillMount(){
        // console.log(window.location);
    }

    render () {
        var result = null;

        if (this.props.rooms.fetched){
            result = <VideoPlayer socket={ socket }/>;
        }
        return (
            <div>
              <h1>NOW-SYNC</h1>
              <Room socket={ socket }/>
              { result }
            </div>
        );
    }
}


Layout.propTypes = {
    rooms: React.PropTypes.object,
    videoPlayerReducer: React.PropTypes.object,
    location: React.PropTypes.object
};

const mapStateToProps = (state) => {
    return state;
};

export default connect(
    mapStateToProps
)(Layout);
