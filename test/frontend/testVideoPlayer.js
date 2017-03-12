import React from "react";
import chai from "chai";
import { shallow } from "enzyme";
import YouTube from "react-youtube";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { VideoPlayer } from "../../src/frontend/js/components/videoPlayer";
import * as actions from "../../src/frontend/js/actions/videoPlayerActions";

var should = chai.should();

describe.only("<VideoPlayer />", () => {
    describe("should render a", () => {
        var wrapper;

        before(() => {
            wrapper = shallow(<VideoPlayer />);
        });

        it("<YouTube />", () => {
            wrapper.find(YouTube).should.have.length(1);
        });

        it("form with one input field", () => {
            wrapper.find("form").should.have.length(1);
            wrapper.find("input").should.have.length(1);
        });
    });

    describe("actions", () => {
        var middlewares;
        var mockStore;
        var store;
        var expected;

        before(() => {
            middlewares = [thunk];
            mockStore = configureMockStore(middlewares);
        });

        beforeEach(() => {
            store = mockStore({});
        });

        it("dispatches a changeVideo action", () => {
            expected = [{type: "changeVideo"}];
            store.dispatch(actions.changeVideo());
            store.getActions().should.deep.equal(expected);
        });

        it("dispatches a newURLInput action with the given URL", () => {
            var url = "https://www.youtube.com/watch?v=XMgcHv-HGCY";
            expected = [{type: "newURLInput", url: url}];
            store.dispatch(actions.newURLInput(url));
            store.getActions().should.deep.equal(expected);
        });

        it("dispatches a play action", () => {
            expected = [{type: "play"}];
            store.dispatch(actions.play());
            store.getActions().should.deep.equal(expected);
        });

        it("dispatches a pause action", () => {
            expected = [{type: "pause"}];
            store.dispatch(actions.pause());
            store.getActions().should.deep.equal(expected);
        });

        it("dispatches a buffer action", () => {
            expected = [{type: "buffer"}];
            store.dispatch(actions.buffer());
            store.getActions().should.deep.equal(expected);
        });
    });
});
