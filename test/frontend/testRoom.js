import React from "react";
import chai from "chai";
import { shallow } from "enzyme";
import Room from "../../src/frontend/js/components/room";

var should = chai.should();

describe('<Room />', () => {
    it('should load a form with two inputs and one button', () => {
        const wrapper = shallow(<Room />);
        // wrapper.should.to.have.length(0);
    });
});
