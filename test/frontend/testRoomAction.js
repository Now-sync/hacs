import { createMockStore } from "redux-test-utils";
import thunk from "redux-thunk";
import * as actions from "../../src/frontend/js/actions/roomActions";
import nock from "nock";
import chai from "chai";

var should = chai.should();

const middlewares = [ thunk ];

describe("async actions", () => {
    afterEach(() => {
        nock.cleanAll();
    });

    it("creates FETCH_TODOS_SUCCESS when fetching todos has been done", () => {
        nock("http://example.com/")
            .get("/api/createRoom")
            .reply(200, { body: { roomname: ["foo"] } } );

        const expectedActions = [
          { type: "CreateRoomError" },
          { type:"CreateRoom", body: { roomname: ["foo"] } }
      ];

        const store = createMockStore({ roomname: [] }, middlewares);

        return store.dispatch(actions.createRoom("http://example.com/", "hi"));
            // .then(() => { // return of async actions
            //     expect(store.getActions()).toEqual(expectedActions);
            // });
    });
});
