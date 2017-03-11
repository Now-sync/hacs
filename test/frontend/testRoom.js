import React from "react";
import chai from "chai";
import { connect } from "react-redux";
import { shallowWithStore } from "enzyme-redux";
import { createMockStore } from "redux-test-utils";
import Room from "../../src/frontend/js/components/room";

var should = chai.should();

describe("shallowWithStore", () => {
    const ReactComponent = () => (Room);

    describe("state", () => {
        it("should have the correct state", () => {
            const expectedState = "expectedState";
            const mapStateToProps = (state) => ({
                state,
            });

            const ConnectedComponent = connect(mapStateToProps)(ReactComponent);
            const component = shallowWithStore(<ConnectedComponent />, createMockStore(expectedState));

            (component.props().state).should.to.be.expectedState;
        });
    });


    describe("dispatch", () => {
        it("should dispatch action", () => {
            const action = {
                type: "type",
            };
            const mapDispatchToProps = (dispatch) => ({
                dispatchProp() {
                    dispatch(action);
                },
            });
            const store = createMockStore();

            const ConnectedComponent = connect(undefined, mapDispatchToProps)(ReactComponent);
            const component = shallowWithStore(<ConnectedComponent />, store);
            component.props().dispatchProp();

            (store.isActionDispatched(action)).should.to.be.true;
        });
    });
});
