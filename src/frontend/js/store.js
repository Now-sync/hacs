import { applyMiddleware, createStore, compose } from "redux";
import { createHistory } from 'history';
import { reduxReactRouter} from 'redux-router';

import logger from "redux-logger";
import thunk from "redux-thunk";

import reducer from "./reducers";

const middleware = compose(
    applyMiddleware(thunk, logger()),
    reduxReactRouter({createHistory}));

export default createStore(reducer, middleware);
