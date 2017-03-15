import { combineReducers } from "redux";
import { routerReducer } from 'react-router-redux'

import rooms from "./roomReducer";
import videoPlayerReducer from "./videoPlayerReducer";

export default combineReducers({
  rooms,
  videoPlayerReducer,
  routing: routerReducer
});
