import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Router, Route, Switch } from "react-router";
import { syncHistoryWithStore } from 'react-router-redux';
import { createBrowserHistory } from "history";

import Layout from "./components/Layout";
import Room from "./components/room";
import store from "./store";

const app = document.getElementById('app');

const history = syncHistoryWithStore(createBrowserHistory(), store);

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Switch>
                <Route exact path="/" component={Layout}/>
                <Route path="/room/*" component={Room}/>
            </Switch>
        </Router>
    </Provider>, app);
