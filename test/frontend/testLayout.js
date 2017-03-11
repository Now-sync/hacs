import React from "react";
import chai from "chai";
import { shallow } from "enzyme";
import Layout from "../../src/frontend/js/components/Layout";
import Room from "../../src/frontend/js/components/room";

var should = chai.should();

describe("<Layout />", function () {
    it("should render a <Room />", function () {
        const wrapper = shallow(<Layout />);
        wrapper.find(Room).should.have.length(1);
    });
});
