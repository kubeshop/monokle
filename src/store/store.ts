import {composeWithDevTools} from "redux-devtools-extension";
import {AnyAction, applyMiddleware, createStore, Store} from "redux";
import thunk from "redux-thunk";
import {AppState} from "../models/state";
import mainReducer from "./reducer";

const composedEnhancer = composeWithDevTools(applyMiddleware(thunk))
const store: Store<AppState, AnyAction> = createStore(mainReducer, composedEnhancer)

export default store;
