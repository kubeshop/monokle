import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {applyMiddleware, createStore, Store} from "redux";
import fileReducer from "./store/reducer";
import thunk from "redux-thunk";
import { composeWithDevTools } from 'redux-devtools-extension'
import {Provider} from "react-redux";
import {AppState, SetRootFolderAction, SetRootFolderDispatchType} from "./models/state";

const composedEnhancer = composeWithDevTools(applyMiddleware(thunk))

const store: Store<AppState, SetRootFolderAction> & {
  dispatch: SetRootFolderDispatchType
} = createStore(fileReducer, composedEnhancer)

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App/>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
