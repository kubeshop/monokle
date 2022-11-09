import React from 'react';
import ReactDOM from 'react-dom';
import {ErrorBoundary} from 'react-error-boundary';
import {Provider} from 'react-redux';
import 'react-reflex/styles.css';

import 'antd/dist/antd.less';

import * as log from 'loglevel';

import '@redux/ipcRendererRedux';
import store from '@redux/store';
import '@redux/storeListeners';

import {ErrorPage} from '@components/organisms/ErrorPage/ErrorPage';

import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  log.enableAll();
  log.debug('Enabled all log levels');
}

console.log('test');

ReactDOM.render(
  <Provider store={store}>
    <ErrorBoundary FallbackComponent={ErrorPage}>
      <App />
    </ErrorBoundary>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
