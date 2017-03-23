import React from "react";
import { connect } from "react-redux";

export class ChatBox extends React.Component {
    render() {
        return (
            <div className="chatBox">
                <div className="messagesDisplay"><p>Hello</p></div>
                <div className="enterMessage">
                    <textarea placeholder="Enter your message"></textarea>
                    <button>Send</button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return state;
};

export default connect(
    mapStateToProps
)(ChatBox);
