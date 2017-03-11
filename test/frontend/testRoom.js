import React from "react";
import chai from "chai";
<<<<<<< HEAD
import { connect } from "react-redux";
import { shallowWithStore } from "enzyme-redux";
import { createMockStore } from "redux-test-utils";
=======
import { shallow } from "enzyme";
>>>>>>> 4ede7b7149ef0587c4f9521f986a8942e50bf675
import Room from "../../src/frontend/js/components/room";

var should = chai.should();

<<<<<<< HEAD
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
=======
describe('<Room />', () => {
    it('should load a form with two inputs and one button', () => {
        const wrapper = shallow(<Room />);
        // wrapper.should.to.have.length(0);
>>>>>>> 4ede7b7149ef0587c4f9521f986a8942e50bf675
    });
});
