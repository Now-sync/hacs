import React from "react";
import chai from "chai";
import { shallow, mount } from "enzyme";
import YouTube from "react-youtube";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import jsdom from "jsdom";
import sinon from "sinon";
import chaiSinon from "chai-sinon";

import { VideoPlayer } from "../../src/frontend/js/components/videoPlayer";
import * as actions from "../../src/frontend/js/actions/videoPlayerActions";
import reducer from "../../src/frontend/js/reducers/videoPlayerReducer";

var should = chai.should();
chai.use(chaiSinon);
var doc = jsdom.jsdom("<!DOCTYPE html><html><body></body></html>");
global.document = doc;
global.window = doc.defaultView;

describe("<VideoPlayer />", () => {
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

    describe("DOM elements", () => {
        var wrapper;
        var stub;

        afterEach(() => {
            stub.restore();
        });

        it("should fire handleURLChange() when something is typed into the input field", () => {
            wrapper = mount(<VideoPlayer />);
            stub = sinon.stub(wrapper.instance(), "handleURLChange", e => e.target.value);
            // force update so the stub is used: https://github.com/airbnb/enzyme/issues/586
            wrapper.update();
            wrapper.find("input").simulate("change", {target: {value: "test"}});
            stub.should.have.been.calledWith(sinon.match({target: {value: "test"}}));
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

    describe("reducer", () => {
        var expected;
        var action;
        var state;

        beforeEach(() => {
            state = {
                inputURL: null,
                url: null,
                videoId: null,
                playing: false,
                buffering: false
            };

            expected = {
                inputURL: null,
                url: null,
                videoId: null,
                playing: false,
                buffering: false
            };
        });

        it("should return the initial state", () => {
            action = {};
            reducer(undefined, action).should.deep.equal(expected);
        });

        it("should handle a newURLInput action", () => {
            var url = "https://www.youtube.com/watch?v=RMF-1F_v53o";
            action = {
                type: "newURLInput",
                url: url
            };
            expected.inputURL = url;
            reducer(undefined, action).should.deep.equal(expected);
        });

        it("should handle a changeVideo action", () => {
            var url = "https://www.youtube.com/watch?v=Ua3hZXfNZOE";
            action = {
                type: "changeVideo"
            };
            state.inputURL = url;
            expected.inputURL = url;
            expected.url = url;
            expected.videoId = "Ua3hZXfNZOE";
            reducer(state, action).should.deep.equal(expected);
        });

        it("should handle a play action", () => {
            var url ="https://www.youtube.com/watch?v=TvwnrYJZpXc";
            action = {
                type: "play"
            };
            state.url = url;
            state.videoId = "TvwnrYJZpXc";
            expected.url = url;
            expected.videoId = "TvwnrYJZpXc";
            expected.playing = true;
            reducer(state, action).should.deep.equal(expected);
        });

        it("should handle a pause action", () => {
            var url = "https://www.youtube.com/watch?v=NGY1gmVZVlo";
            action = {
                type: "pause"
            };
            state.url = url;
            state.videoId = "NGY1gmVZVlo";
            state.playing = true;
            expected.url = url;
            expected.videoId = "NGY1gmVZVlo";
            expected.playing = false;
            reducer(state, action).should.deep.equal(expected);
        });

        it("should handle a buffer action", () => {
            var url = "https://www.youtube.com/watch?v=2Z4m4lnjxkY";
            action = {
                type: "buffer"
            };
            state.url = url;
            state.videoId = "2Z4m4lnjxkY";
            state.playing = true;
            expected.url = url;
            expected.videoId = "2Z4m4lnjxkY";
            expected.playing = false;
            expected.buffering = true;
            reducer(state, action).should.deep.equal(expected);
        });
    });
});
