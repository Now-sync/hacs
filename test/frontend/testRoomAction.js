import { createMockStore } from "redux-test-utils";
import thunk from "redux-thunk";
import * as actions from "../../src/frontend/js/actions/roomActions";
import nock from "nock";
import chai from "chai";

var should = chai.should();

const middlewares = [ thunk ];
const mockStore = createMockStore(middlewares);

describe("async actions", () => {
    afterEach(() => {
        nock.cleanAll();
    });

    it("successfully creates a room", () => {
        nock("https://localhost:3000")
            .put("/api/createRoom")
            .reply(200, { body: { roomname: ["foo"] } } );

        const expectedActions = [
          { type:"CreateRoom", body: { roomname: ["foo"] } } ];

        mockStore.dispatch(actions.createRoom("https://www.youtube.com/watch?v=NdJ6BbvTw-s", "hi"))
            .then(() => { // return of async actions
                (mockStore.getActions()).should.to.equal(expectedActions);
            });
    });
});
