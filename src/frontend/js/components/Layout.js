import React from "react";
import { connect } from "react-redux";

import { createRooms } from "../actions/roomsActions";

class Layout extends React.Component {
  constructor(props) {
    super(props);
  }

  click(){
    this.props.createRoom();
  }

  render () {
    console.log(this.props);
    return (
      <div>
        <h1>HELLO FROM REACT</h1>
        <h2>Room created?: {this.props.rooms.fetched}</h2>
        <button onClick={this.click.bind(this)}>CreateRoom</button>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createRoom: () => dispatch(createRooms("CreateRoom"))
  };
};

const mapStateToProps = (state) => {
  return state;
};

const DefaultApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(Layout);

export default DefaultApp;
