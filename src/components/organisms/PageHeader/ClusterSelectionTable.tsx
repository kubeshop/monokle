import {FC, useCallback, useEffect, useState} from 'react';

import {Button, Form, Popover} from 'antd';
import Column from 'antd/lib/table/Column';

import {CLUSTER_AVAILABLE_COLORS} from '@constants/constants';

import {setCurrentContext, setKubeConfigContextColor} from '@redux/appConfig';
import {selectKubeContext, selectKubeconfig} from '@redux/cluster/selectors';
import {KUBECTL} from '@redux/cluster/service/kube-control';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {useNotifications} from '@utils/notification';

import {AlertEnum} from '@shared/models/alert';
import {ClusterColors} from '@shared/models/cluster';
import {BackgroundColors} from '@shared/styles/colors';

import * as S from './ClusterSelectionTable.styled';

interface ClusterSelectionTableProps {
  setIsClusterDropdownOpen: (isOpen: boolean) => void;
}

interface ClusterTableRow {
  name: string;
  namespaces: string[];
  hasFullAccess?: boolean;
  editable: boolean;
  color?: ClusterColors;
}

export const ClusterSelectionTable: FC<ClusterSelectionTableProps> = ({setIsClusterDropdownOpen}) => {
  const dispatch = useAppDispatch();
  const notify = useNotifications();
  const clusterAccess = useAppSelector(state => state.config?.clusterAccess);
  const kubeconfig = useAppSelector(selectKubeconfig);
  const currentContext = useAppSelector(selectKubeContext);
  const kubeConfigContextsColors = useAppSelector(state => state.config.kubeConfigContextsColors);

  const [changeClusterColor, setChangeClusterColor] = useState('');
  const [editingKey, setEditingKey] = useState('');
  const [localClusters, setLocalClusters] = useState<ClusterTableRow[]>([]);

  const [form] = Form.useForm();

  const isEditing = useCallback((record: ClusterTableRow) => record.name === editingKey, [editingKey]);
  const rowClassName = useCallback(
    (cluster: ClusterTableRow) => {
      let className = '';

      if (currentContext?.name === cluster.name) {
        className += 'table-active-row ';
      }

      if (changeClusterColor === cluster.name) {
        className += 'table-row-changing-cluster-color';
      }

      return className.trim();
    },
    [changeClusterColor, currentContext]
  );

  const edit = (record: Partial<ClusterTableRow>) => {
    form.setFieldsValue({name: '', namespaces: [], hasFullAccess: false, ...record});
    setEditingKey(record.name as string);
  };

  const save = async (clusterName: string) => {
    const localCluster = localClusters.find(c => c.name === clusterName);
    if (!localCluster) {
      return;
    }
    setEditingKey('');
  };

  const handleClusterChange = useCallback(
    (contextName: string) => {
      setIsClusterDropdownOpen(false);

      if (contextName === currentContext?.name) {
        return;
      }

      KUBECTL.updateContext(contextName, {kubeconfig: kubeconfig?.path})
        .then(() => dispatch(setCurrentContext(contextName)))
        .catch((err: Error) => {
          const cause = err.cause instanceof Error ? err.cause.message : 'The cause is unknown.';
          notify.error(err.message, {description: cause});
        });
    },
    [setIsClusterDropdownOpen, currentContext?.name, kubeconfig?.path, dispatch, notify]
  );

  const updateClusterColor = (name: string, color: ClusterColors) => {
    dispatch(setKubeConfigContextColor({name, color}));
    setChangeClusterColor('');
    dispatch(setAlert({type: AlertEnum.Success, title: `${name} accent color was changed successfully`, message: ''}));
  };

  const isColorSelected = useCallback(
    (name: string, color: ClusterColors) => {
      const currentCluster = localClusters.find(cl => cl.name === name);

      if (!currentCluster) {
        return false;
      }

      if (
        (!currentCluster.color && color === BackgroundColors.clusterModeBackground) ||
        currentCluster.color === color
      ) {
        return true;
      }

      return false;
    },
    [localClusters]
  );

  useEffect(() => {
    if (!kubeconfig?.isValid) {
      setLocalClusters([]);
      return;
    }

    const clusterTableRows: ClusterTableRow[] = kubeconfig.contexts.map(context => {
      const contextNamespaces = clusterAccess.filter(appNs => appNs.context === context.name);
      const clusterSpecificAccess = clusterAccess?.filter(ca => ca.context === context.name) || [];
      const hasFullAccess = clusterSpecificAccess.length
        ? clusterSpecificAccess?.every(ca => ca.hasFullAccess)
        : undefined;

      return {
        namespaces: contextNamespaces.map(ctxNs => ctxNs.namespace),
        name: context.name,
        hasFullAccess,
        editable: true,
        color: kubeConfigContextsColors[context.name],
      };
    });

    setLocalClusters(clusterTableRows);
  }, [kubeconfig, clusterAccess, kubeConfigContextsColors]);

  return (
    <Form form={form} component={false}>
      <S.Table
        size="small"
        showSorterTooltip={false}
        dataSource={localClusters}
        pagination={false}
        scroll={{y: 300}}
        rowKey="name"
        rowClassName={(cluster: ClusterTableRow) => rowClassName(cluster)}
      >
        <Column
          className="table-column-name"
          title="Context"
          dataIndex="name"
          key="name"
          ellipsis
          width={350}
          onCell={(cluster: ClusterTableRow) => ({onClick: () => handleClusterChange(cluster.name)})}
        />
        <Column
          className="table-column-actions"
          key="clusterActions"
          dataIndex="clusterActions"
          ellipsis
          width={75}
          render={(value: any, record: ClusterTableRow) => {
            if (isEditing(record)) {
              return (
                <Button onClick={() => save(record.name)} type="default">
                  Done
                </Button>
              );
            }

            return (
              <S.ActionsContainer className="cluster-actions-container">
                <Popover
                  content={
                    <S.ClusterColorsContainer>
                      {CLUSTER_AVAILABLE_COLORS.map(color => (
                        <S.ClusterColor
                          key={color}
                          $color={color}
                          $selected={isColorSelected(record.name, color)}
                          $size="big"
                          onClick={() => updateClusterColor(record.name, color)}
                        />
                      ))}
                    </S.ClusterColorsContainer>
                  }
                  overlayClassName="cluster-color-popover"
                  placement="bottom"
                  open={changeClusterColor === record.name}
                  title={
                    <>
                      <S.TitleText>Avoid mistakes by selecting an accent color for your cluster.</S.TitleText>
                      <S.DefaultColorContainer>
                        <S.ClusterColor
                          $color={BackgroundColors.clusterModeBackground}
                          $selected={isColorSelected(record.name, BackgroundColors.clusterModeBackground)}
                          $size="big"
                          onClick={() => updateClusterColor(record.name, BackgroundColors.clusterModeBackground)}
                        />
                        <span>Default</span>
                      </S.DefaultColorContainer>
                    </>
                  }
                  trigger="click"
                  zIndex={1500}
                  onOpenChange={visible => {
                    if (!visible) {
                      setChangeClusterColor('');
                    }
                  }}
                >
                  <S.ClusterColor
                    $color={kubeConfigContextsColors[record.name] || BackgroundColors.clusterModeBackground}
                    $selected
                    $size="small"
                    onClick={() => {
                      setChangeClusterColor(record.name);
                    }}
                  />
                </Popover>
              </S.ActionsContainer>
            );
          }}
        />
      </S.Table>
    </Form>
  );
};
