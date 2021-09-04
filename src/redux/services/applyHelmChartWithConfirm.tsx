import {ThunkDispatch} from 'redux-thunk';
import {Modal} from 'antd';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {applyHelmChart} from '@redux/thunks/applyHelmChart';
import {HelmChart, HelmValuesFile} from '@models/helm';
import {FileMapType} from '@models/appstate';

export function applyHelmChartWithConfirm(
  valuesFile: HelmValuesFile,
  helmChart: HelmChart,
  fileMap: FileMapType,
  dispatch: ThunkDispatch<any, any, any>,
  kubeconfig: string,
  options?: {
    isClusterPreview?: boolean;
    shouldPerformDiff?: boolean;
  }
) {
  Modal.confirm({
    title: `Install the ${helmChart.name} Chart using ${valuesFile.name} in configured cluster?`,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        applyHelmChart(valuesFile, helmChart, fileMap, dispatch, kubeconfig);
        resolve({});
      });
    },
    onCancel() {},
  });
}
