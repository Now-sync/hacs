import React from "react";
import { connect } from "react-redux";


export class PasswordAuth extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div>
                <p>Enter the password on page</p>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return state;
};

export default connect(
    mapStateToProps
)(PasswordAuth);
