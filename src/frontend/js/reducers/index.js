import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import rooms from "./roomReducer";
import videoPlayerReducer from "./videoPlayerReducer";
import chatBox from "./chatBoxReducer";

export default combineReducers({
  rooms,
  videoPlayerReducer,
  chatBox,
  routing: routerReducer
});
