import React from "react";
import Room from "./room";
import VideoPlayer from "./videoPlayer";
import PasswordAuth from "./passwordAuth";
import { connect } from "react-redux";
import io from "socket.io-client";

var socket = io();
//insert css here using require statement


class Layout extends React.Component {

    componentWillMount(){
        this.props.history.push("/");
    }

    render () {
        var result = null;

        if (this.props.rooms.fetched){
            result = <VideoPlayer history={this.props.history} socket={ socket }/>;
        }else if (this.props.location.pathname === "/room/?roomname"+this.props.rooms.room.roomname) {
            result = <PasswordAuth />;
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
    history: React.PropTypes.object,
    location: React.PropTypes.object
};

const mapStateToProps = (state) => {
    return state;
};

export default connect(
    mapStateToProps
)(Layout);
