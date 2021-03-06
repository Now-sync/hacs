import React from "react";
import chai from "chai";
import { shallow, mount } from "enzyme";
import YouTube from "react-youtube";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import jsdom from "jsdom";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import io from "socket.io-client";
import { Server } from "mock-socket";

import { VideoPlayer } from "../../src/frontend/js/components/videoPlayer";
import * as actions from "../../src/frontend/js/actions/videoPlayerActions";
import reducer from "../../src/frontend/js/reducers/videoPlayerReducer";

var should = chai.should();
chai.use(sinonChai);

describe("<VideoPlayer />", () => {
    var doc;
    var socketURL;
    var mockServer;
    var socket;

    before(() => {
        doc = jsdom.jsdom("<!DOCTYPE html><html><body></body></html>");
        global.document = doc;
        global.window = doc.defaultView;
        socketURL = "http://localhost:3002";
        mockServer = new Server(socketURL);
        socket = io(socketURL);
    });

    after(() => {
        mockServer.stop();
    });

    xdescribe("should render a", () => {
        var wrapper;
        var state = {
            room: {
                roomname: null,
                users: null,
            },
            password: null,
            fetched: false,
            error: null,
        };

        before(() => {
            wrapper = shallow(<VideoPlayer history={{
                push: () => null
            }} socket={socket} state={state} />);
        });

        it("<YouTube />", () => {
            wrapper.find(YouTube).should.have.length(1);
        });

        it("form with one input field", () => {
            wrapper.find("Form").should.have.length(1);
            wrapper.find("FormControl").should.have.length(1);
        });
    });

    xdescribe("DOM elements", () => {
        var wrapper;
        var stub;

        var state = {
            room: {
                roomname: null,
                users: null,
            },
            password: null,
            fetched: false,
            error: null,
        };

        before(() => {
            wrapper = mount(<VideoPlayer history={{
                push: () => null
            }} socket={socket} state={state} />);
        });

        afterEach(() => {
            stub.restore();
        });

        it("should fire handleURLChange() with the input text when something is typed in", () => {
            stub = sinon.stub(wrapper.instance(), "handleURLChange", e => e);
            // force update so the stub is used: https://github.com/airbnb/enzyme/issues/586
            wrapper.update();
            wrapper.find("input").simulate("change", {target: {value: "test"}});
            stub.should.have.been.calledWithMatch({target: {value: "test"}});
        });

        it("should fire handleSubmit() when the form is submitted", () => {
            stub = sinon.stub(wrapper.instance(), "handleSubmit", e => e);
            wrapper.update();
            wrapper.find("form").simulate("submit");
            stub.should.have.been.called;
        });
    });

    xdescribe("sockets", () => {
        // TODO: FIND A WAY TO TEST THESE, implicit calls to done don't work
        var wrapper;

        it("should fire a play event when handleStateChange() has a play action", done => {
            mockServer.on("play", done);
            wrapper = shallow(<VideoPlayer socket={socket}
                                play={() => null}
                                />);
            wrapper.instance().handleStateChange({data: 1});
        });

        it("should play the video when a play event is received", done => {
            wrapper = shallow(<VideoPlayer socket={socket} />);
            wrapper.instance().player.play = done;
            mockServer.emit("play");
        });

        it("should fire a pause event when handleStateChange() has a pause action", done => {
            // mockServer.on("pause", data => {
            //     if (data.pausedtime === 5) done();
            // });
            mockServer.on("pause", done);
            wrapper = shallow(<VideoPlayer socket={socket}
                                pause={() => null}
                                />);
            // can't stub player getCurrentTime because player is set once the youtube player loads
            // hopefully this test won't break
            wrapper.instance().player.getCurrentTime = () => 5;
            // var stub = sinon.stub(wrapper.instance().player, "getCurrentTime", () => 5);
            wrapper.instance().handleStateChange({data: 2});
            // stub.restore();
        });

        it("should pause the video when a pause event is received", done => {
            wrapper = shallow(<VideoPlayer socket={socket} />);
            wrapper.instance().player.pauseVideo = done;
            mockServer.emit("pause", {
                pausedtime: 10,
                username: "joebob"
            });
        });

        it("should fire a change video event when the form is submitted", done => {
            var url = "https://www.youtube.com/watch?v=EjKdAWNUu3g";
            // mockServer.on("videoChange", data => {
            //     if (data.videoUrl === url) done();
            // });
            mockServer.on("videoChange", done);
            wrapper = shallow(<VideoPlayer socket={socket}
                                url={url}
                                changeVideo={() => null}
                                />);
            var e = {
                preventDefault: () => null,
                target: {
                    reset: () => null
                }
            };
            wrapper.instance().handleSubmit(e);
        });

        it("should change the video when a change video event is received", done => {
            var url = "https://www.youtube.com/watch?v=JmCbO2pYYfU";
            wrapper = shallow(<VideoPlayer socket={socket} />);
            wrapper.instance().player.changeVideo = done;
            mockServer.emit("videoChange", {
                videoUrl: url,
                username: "bobjoe",
                skipTo: 0
            });
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
            var url = "https://www.youtube.com/watch?v=dA8PT_djQN4";
            expected = [{type: "changeVideo", url: url}];
            store.dispatch(actions.changeVideo(url));
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
                ready: false
            };

            expected = {
                inputURL: null,
                url: null,
                videoId: null,
                playing: false,
                ready: false
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
                type: "changeVideo",
                url: url
            };
            expected.url = url;
            expected.videoId = "Ua3hZXfNZOE";
            reducer(undefined, action).should.deep.equal(expected);
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
    });
});
