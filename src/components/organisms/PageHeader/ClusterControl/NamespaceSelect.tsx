import {useCallback} from 'react';

import {Select, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterNamespaceTooltip} from '@constants/tooltips';

import {kubeConfigContextSelector} from '@redux/appConfig';
import {connectCluster} from '@redux/cluster/thunks/connect';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

import {Colors} from '@shared/styles';
import {trackEvent} from '@shared/utils';

import * as S from '../Controls.styled';

export function NamespaceSelect() {
  const dispatch = useAppDispatch();
  const clusterConnection = useAppSelector(state => state.main.clusterConnection);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const [namespaces] = useTargetClusterNamespaces();

  const onNamespaceChanged = useCallback(
    (namespace: any) => {
      dispatch(connectCluster({context: kubeConfigContext, namespace, reload: true}));
      trackEvent('dashboard/changeNamespace');
    },
    [dispatch, kubeConfigContext]
  );

  return (
    <Tooltip placement="left" mouseEnterDelay={TOOLTIP_DELAY} title={ClusterNamespaceTooltip}>
      <S.Select
        value={clusterConnection?.namespace}
        showSearch
        onChange={onNamespaceChanged}
        dropdownStyle={{minWidth: 200, width: '100%'}}
        style={{color: Colors.grey7}}
      >
        <Select.Option key="<all>" value="<all>">{`<all>`}</Select.Option>
        <Select.Option key="<not-namespaced>" value="<not-namespaced>">
          {`<not-namespaced>`}
        </Select.Option>

        {namespaces.map((ns: string) => (
          <Select.Option key={ns} value={ns}>
            {ns}
          </Select.Option>
        ))}
      </S.Select>
    </Tooltip>
  );
}
