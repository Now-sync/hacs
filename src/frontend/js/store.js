import { applyMiddleware, createStore } from "redux";
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';

import logger from "redux-logger";
import thunk from "redux-thunk";

import reducer from "./reducers";

const middleware = applyMiddleware(thunk, logger(), routerMiddleware(browserHistory));

export default createStore(reducer, middleware);
