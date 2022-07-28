import {FC, useCallback, useEffect, useState} from 'react';

import {Button, Form, Popover, Tooltip} from 'antd';
import Column from 'antd/lib/table/Column';

import {v4 as uuid} from 'uuid';

import {CLUSTER_AVAILABLE_COLORS, TOOLTIP_DELAY} from '@constants/constants';

import {AlertEnum} from '@models/alert';
import {ClusterColors} from '@models/cluster';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {setCurrentContext, setKubeConfigContextColor, updateClusterNamespaces} from '@redux/reducers/appConfig';
import {kubeConfigContextSelector, kubeConfigContextsSelector} from '@redux/selectors';

import {FilePatternList} from '@molecules';

import {runCommandInMainThread} from '@utils/commands';

import {BackgroundColors} from '@styles/Colors';

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
  const clusterAccess = useAppSelector(state => state.config?.clusterAccess);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContexts = useAppSelector(kubeConfigContextsSelector);
  const kubeConfigContextsColors = useAppSelector(state => state.config.kubeConfigContextsColors);

  const [changeClusterColor, setChangeClusterColor] = useState('');
  const [editingKey, setEditingKey] = useState('');
  const [localClusters, setLocalClusters] = useState<ClusterTableRow[]>([]);

  const [form] = Form.useForm();

  const clusterAccessRender = useCallback((hasFullAccess?: boolean) => {
    if (hasFullAccess === undefined) {
      return 'Unknown';
    }

    return hasFullAccess ? 'Full Access' : 'Restricted Access';
  }, []);
  const isEditing = useCallback((record: ClusterTableRow) => record.name === editingKey, [editingKey]);
  const rowClassName = useCallback(
    (cluster: ClusterTableRow) => {
      let className = '';

      if (kubeConfigContext === cluster.name) {
        className += 'table-active-row ';
      }

      if (changeClusterColor === cluster.name) {
        className += 'table-row-changing-cluster-color';
      }

      return className.trim();
    },
    [changeClusterColor, kubeConfigContext]
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

  const clusterNamespaceRender = (cluster: ClusterTableRow) => {
    const editing = isEditing(cluster);

    if (editing) {
      return (
        <FilePatternList
          value={cluster.namespaces}
          onChange={ns => onNamespacesChange(ns.map(n => ({namespace: n, cluster: cluster.name})))}
          tooltip="Add new namespace"
          showButtonLabel="Add namespace"
        />
      );
    }

    const namespacesTooltip = cluster.namespaces.map(ns => <span key={ns}>{ns}</span>);
    return (
      <Tooltip
        mouseEnterDelay={TOOLTIP_DELAY}
        title={<S.NamespacesTooltipContainer>{namespacesTooltip}</S.NamespacesTooltipContainer>}
      >
        <S.ClusterAccessContainer>{cluster.namespaces.length}</S.ClusterAccessContainer>
      </Tooltip>
    );
  };

  const onNamespacesChange = (values: {namespace: string; cluster: string}[]) => {
    dispatch(updateClusterNamespaces(values));
  };

  const handleClusterChange = (clusterName: string) => {
    setIsClusterDropdownOpen(false);

    if (clusterName === kubeConfigContext) {
      return;
    }

    runCommandInMainThread({
      commandId: uuid(),
      cmd: `kubectl`,
      args: ['config', 'use-context', clusterName],
    }).then(arg => {
      if (arg?.exitCode === 0) {
        dispatch(setCurrentContext(clusterName));
      } else {
        dispatch(
          setAlert({
            title: 'Error changing cluster context',
            message: arg.stderr as string,
            type: AlertEnum.Error,
          })
        );
      }
    });
  };

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
    const clusterTableRows: ClusterTableRow[] = kubeConfigContexts.map(context => {
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
  }, [kubeConfigContexts, clusterAccess, kubeConfigContextsColors]);

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
          title="Cluster name"
          dataIndex="name"
          key="name"
          ellipsis
          width={350}
          onCell={(cluster: ClusterTableRow) => ({onClick: () => handleClusterChange(cluster.name)})}
        />
        <Column
          title="Namespaces"
          dataIndex="namespaces"
          key="namespaces"
          ellipsis
          render={(_: any, record: ClusterTableRow) => (record ? clusterNamespaceRender(record) : '-')}
          width={200}
        />
        <Column
          title="Access"
          dataIndex="hasFullAccess"
          key="hasFullAccess"
          render={(_: any, record: ClusterTableRow) => clusterAccessRender(record.hasFullAccess)}
          ellipsis
          width={140}
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
                <S.EditOutlined
                  onClick={e => {
                    e.stopPropagation();
                    edit(record);
                  }}
                />

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
                  visible={changeClusterColor === record.name}
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
                  onVisibleChange={visible => {
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
