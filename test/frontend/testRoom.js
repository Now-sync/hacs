import React from "react";
import chai from "chai";
import { shallow } from "enzyme";
import jsdom from "jsdom";
import sinonChai from "sinon-chai";

import { Room } from "../../src/frontend/js/components/room";
import reducer from "../../src/frontend/js/reducers/roomReducer";


var should = chai.should();
chai.use(sinonChai);
var doc = jsdom.jsdom("<!DOCTYPE html><html><body></body></html>");
global.document = doc;
global.window = doc.defaultView;

describe("Room", () => {
    describe("should render", () => {
        var wrapper;

        before(() => {
            wrapper = shallow(<Room rooms={{error: null}} />);
        });

        it("a form with two inputs and a button", () => {
            wrapper.find("Form").should.have.length(1);
            wrapper.find("FormControl").should.have.length(2);
            wrapper.find("Button").should.have.length(1);
        });
    });

    // describe("actions", () => {
    //     var middlewares;
    //     var mockStore;
    //     var store;
    //     var expectedActions;
    //     var sandbox;
    //
    //     before(() => {
    //         middlewares = [thunk];
    //         mockStore = configureMockStore(middlewares);
    //     });
    //
    //     beforeEach(() => {
    //         sandbox = sinon.sandbox.create();
    //         store = mockStore({ todos: [] });
    //     });
    //
    //     afterEach(() => {
    //         sandbox.restore();
    //     });
    //
    //     it.only("dispatches a createRoom action", () => {
    //         nock('https://localhost:3000')
    //           .put('/api/createRoom')
    //           .reply(200, { payload: { todos: ['do something'] } });
    //
    //         expectedActions = [
    //           { type: "CreateRoom", payload: { todos: ['do something']  } },
    //           { type: "CreateRoomError", payload: { todos: ['do something']  } }
    //         ];
    //
    //         return store.dispatch(actions.createRoom("https://www.youtube.com/watch?v=RMF-1F_v53o", "hi"))
    //             .then (() => {
    //                 console.log(" HE");
    //             });
    //     });
    // });

    describe("reducer", () => {
        var expected;
        var action;
        var state;

        beforeEach(() => {
            state = {
                room: {
                    roomname: null,
                    users: null,
                },
                password: null,
                fetched: false,
                error: null,
                roomStatus: "FETCHING"
            };

            expected = {
                room: {
                    roomname: null,
                    users: null,
                },
                password: null,
                fetched: false,
                error: null,
                roomStatus: "FETCHING"
            };
        });

        it("should return the initial state", () => {
            action = {};
            reducer(undefined, action).should.deep.equal(expected);
        });

        it("should handle a CreateRoom action", () => {
            action = {
                 type: "CreateRoom",
                 payload: {
                     roomname: "room1"
                 },
                 pass: "hi"
             };

             state.fetched = true;
             state.password = "hi";
             expected.room = {
                 roomname: "room1"
             };
             expected.fetched = true;
             expected.password = "hi";

             reducer(state, action).should.deep.equal(expected);
        });

        it("should handle a CreateRoomError action", () => {
            action = {
                 type: "CreateRoomError",
                 payload: {
                     roomname: "ERROR"
                 },
                 pass: "hi"
             };

             state.fetched = false;
             expected.error = {
                 roomname: "ERROR"
             };
             expected.fetched = false;

             reducer(state, action).should.deep.equal(expected);
        });
    });

});
