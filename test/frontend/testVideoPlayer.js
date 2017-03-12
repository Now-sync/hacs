import React from "react";
import chai from "chai";
import { shallow } from "enzyme";
import YouTube from "react-youtube";

import { VideoPlayer } from "../../src/frontend/js/components/videoPlayer";

var should = chai.should();

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
});
