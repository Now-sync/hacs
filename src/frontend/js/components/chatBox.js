import React from "react";
import { connect } from "react-redux";
import { Form, FormGroup, Col, FormControl} from "react-bootstrap";

import * as actions from "../actions/chatBoxActions";

export class ChatBox extends React.Component {
    constructor(props) {
        super(props);
        this.socket = {};
    }

    componentWillMount = () => {
        this.socket = this.props.socket;
    }

    componentDidMount = () => {
        this.socket.on("receivedMessage", data => {
            this.props.updateChatBox(
                <div className="bubble you">
                    <div className="userChatOther">{ data.username + ": " }</div>
                    <div className="contentChat">
                        { data.content }
                    </div>
                    <div className="timeStamp">{ new Date(data.timeStamp).toLocaleString() }</div>
                </div>
            );
        });
    }


    handleSubmit = e => {
        e.preventDefault();
        e.target.reset();

        if (this.props.content.length !== 0){
            this.props.updateChatBox(
                <div className="bubble me">
                    <div className="userChat">Me: </div>
                    <div className="contentChat">
                        { this.props.content }
                    </div>
                </div>);

            this.socket.emit("sendMessage", {
                content: this.props.content
            });

            this.props.enterMessage("");
        }

    }


    handleUserMessage = e => {
        this.props.enterMessage(e.target.value);
    }
    render() {

        const listMessages = this.props.messages.map(message =>
            <div key= {this.props.messages.indexOf(message)}>{ message }</div>
        );

        return (
            <div className="chatBox">
                <div className="message_display">
                    { listMessages }
                </div>
                <div className="enterMessage">
                    <Form horizontal onSubmit={ this.handleSubmit }>
                        <FormGroup controlId="formHorizontalVideoChange">
                            <Col sm={12}>
                                <FormControl type="text" placeholder="Press Enter To Send Message" onChange={ this.handleUserMessage }/>
                            </Col>
                        </FormGroup>
                    </Form>
                </div>
            </div>
        );
    }
}
ChatBox.propTypes = {
    socket: React.PropTypes.object,
    enterMessage: React.PropTypes.func,
    content: React.PropTypes.string,
    updateChatBox: React.PropTypes.func,
    messages: React.PropTypes.array
};

const mapDispatchToProps = dispatch => {
    return {
        enterMessage: content => dispatch(actions.enterMessage(content)),
        updateChatBox: message => dispatch(actions.updateChatBox(message))
    };
};

const mapStateToProps = state => {
    return state.chatBox;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatBox);
