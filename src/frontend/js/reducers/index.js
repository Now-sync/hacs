import { combineReducers } from "redux";

import rooms from "./roomReducer";
import videoPlayerReducer from "./videoPlayerReducer";

export default combineReducers({
  rooms,
  videoPlayerReducer
});
