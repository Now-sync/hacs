import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Router, Route, hashHistory } from "react-router";

import Layout from "./components/Layout";
import store from "./store";

const app = document.getElementById('app');

ReactDOM.render(
    <Provider store={store}>
        <Router history={hashHistory}>
            <Route path="/index.html" component={Layout}/>
        </Router>
    </Provider>, app);
