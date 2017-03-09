import React, { PropTypes } from "react"
import { connect } from "react-redux"

import { counter } from "../actions/roomsActions"

class Layout extends React.Component {
  constructor(props) {
    super(props);
  }

  click(){
    this.props.testClick();
  }

  render () {
    console.log(this.props);
    return (
      <div>
        <h1>HELLO FROM REACT</h1>
        <h2>Counter : {this.props.rooms.counter}</h2>
        <button onClick={this.click.bind(this)}>CreateRoom</button>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    testClick: () => dispatch(counter("Add"))
  }
}

const mapStateToProps = (state) => {
  return state;
}

const DefaultApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(Layout)

export default DefaultApp;
