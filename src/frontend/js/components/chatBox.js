import React from "react";
import { connect } from "react-redux";
import { Form, FormGroup, Col, FormControl} from "react-bootstrap";

var result = [], content = "";

export class ChatBox extends React.Component {
    constructor(props) {
        super(props);
        this.socket = {};
    }

    componentWillMount = () => {
        this.socket = this.props.socket;
    }

    handleSubmit = e => {
        e.preventDefault();
        e.target.reset();
        if (content.length !== 0){
            result.push(
                <div className="bubble me">
                    { content }
                </div>);
            console.log(content, " i typed this");
            this.socket.emit("sendMessage", {
                content: content
            });
        }
        content = "";
    }


    handleUserMessage = e => {
        content = e.target.value;
    }
    render() {
        return (
            <div className="chatBox">
                <div className="message_display">
                    { result }
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
    socket: React.PropTypes.object
};

const mapStateToProps = state => {
    return state;
};

export default connect(
    mapStateToProps
)(ChatBox);
