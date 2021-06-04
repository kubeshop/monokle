import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {applyMiddleware, createStore, Store} from "redux";
import fileReducer from "./store/reducer";
import thunk from "redux-thunk";
import {Provider} from "react-redux";
import {AppState, FileAction, FileDispatchType} from "./models/state";

const store: Store<AppState, FileAction> & {
  dispatch: FileDispatchType
} = createStore(fileReducer, applyMiddleware(thunk))

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
