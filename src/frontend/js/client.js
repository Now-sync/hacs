import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Router, Route } from "react-router";
import { syncHistoryWithStore } from 'react-router-redux';
import { createBrowserHistory } from "history";

import Layout from "./components/Layout";
import store from "./store";

const app = document.getElementById('app');

const history = syncHistoryWithStore(createBrowserHistory(), store);

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/index.html" component={Layout}/>
        </Router>
    </Provider>, app);
