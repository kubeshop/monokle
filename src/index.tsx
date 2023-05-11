import ReactDOM from 'react-dom';
import {ErrorBoundary} from 'react-error-boundary';
import {Provider} from 'react-redux';

import 'antd/dist/antd.less';

import 'allotment/dist/style.css';
import log from 'loglevel';

import '@redux/ipcRendererRedux';
import store from '@redux/store';
import '@redux/storeListeners';

import {ErrorPage} from '@components/organisms/ErrorPage/ErrorPage';

import {ignoreKnownErrors} from '@utils/knownErrors';

import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

declare global {
  interface Window {
    debug_logs: Function;
  }
}

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  log.enableAll();
  log.debug('Enabled all log levels');
}

window.debug_logs = (value: boolean) => {
  if (value) {
    log.enableAll();
    log.debug('Enabled all log levels');
  } else {
    log.disableAll();
    log.debug('Disabled all log levels');
  }
};

ignoreKnownErrors();

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
