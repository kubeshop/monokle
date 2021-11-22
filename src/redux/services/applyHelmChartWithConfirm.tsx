import {Modal} from 'antd';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import {ThunkDispatch} from 'redux-thunk';

import {FileMapType} from '@models/appstate';
import {HelmChart, HelmValuesFile} from '@models/helm';

import {applyHelmChart} from '@redux/thunks/applyHelmChart';

export function applyHelmChartWithConfirm(
  valuesFile: HelmValuesFile,
  helmChart: HelmChart,
  fileMap: FileMapType,
  dispatch: ThunkDispatch<any, any, any>,
  kubeconfig: string,
  context: string,
  options?: {
    isClusterPreview?: boolean;
    shouldPerformDiff?: boolean;
  }
) {
  Modal.confirm({
    title: `Install the ${helmChart.name} Chart using ${valuesFile.name} in cluster [${context}]?`,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        applyHelmChart(valuesFile, helmChart, fileMap, dispatch, kubeconfig, context);
        resolve({});
      });
    },
    onCancel() {},
  });
}
