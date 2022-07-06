import React, {FC, useEffect, useState} from 'react';

import {Button, Form, Tooltip} from 'antd';
import Column from 'antd/lib/table/Column';

import {v4 as uuid} from 'uuid';

import {TOOLTIP_DELAY} from '@constants/constants';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {setCurrentContext, updateClusterNamespaces} from '@redux/reducers/appConfig';
import {kubeConfigContextSelector, kubeConfigContextsSelector} from '@redux/selectors';

import FilePatternList from '@molecules/FilePatternList';

import {runCommandInMainThread} from '@utils/commands';

import * as S from './ClusterSelectionTable.styled';

interface CLusterSelectionTableProps {
  setIsClusterDropdownOpen: (isOpen: boolean) => void;
}

interface ClusterTableRow {
  name: string;
  namespaces: string[];
  hasFullAccess?: boolean;
  editable: boolean;
}

export const ClusterSelectionTable: FC<CLusterSelectionTableProps> = ({setIsClusterDropdownOpen}) => {
  const dispatch = useAppDispatch();
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContexts = useAppSelector(kubeConfigContextsSelector);
  const clusterAccess = useAppSelector(state => state.config?.clusterAccess);

  const [localClusters, setLocalClusters] = useState<ClusterTableRow[]>([]);

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
      };
    });

    setLocalClusters(clusterTableRows);
  }, [kubeConfigContexts, clusterAccess]);

  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record: ClusterTableRow) => record.name === editingKey;

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

  const clusterAccessRender = (hasFullAccess?: boolean) => {
    if (hasFullAccess === undefined) {
      return 'Unknown';
    }

    return hasFullAccess ? 'Full Access' : 'Restricted Access';
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

  return (
    <Form form={form} component={false}>
      <S.Table
        size="small"
        showSorterTooltip={false}
        dataSource={localClusters}
        pagination={false}
        scroll={{y: 300}}
        rowKey="name"
        className="asdasdasd"
        rowClassName={(cluster: ClusterTableRow) => {
          if (kubeConfigContext === cluster.name) {
            return 'table-active-row';
          }

          return '';
        }}
      >
        <Column
          className="table-column-name cluster-table-column-name"
          title="Cluster name"
          dataIndex="name"
          key="name"
          ellipsis
          width={350}
          onCell={(cluster: ClusterTableRow) => ({onClick: () => handleClusterChange(cluster.name)})}
        />
        <Column
          className="cluster-table-column-namespaces"
          title="Namespaces"
          dataIndex="namespaces"
          key="namespaces"
          ellipsis
          render={(_: any, record: ClusterTableRow) => (record ? clusterNamespaceRender(record) : '-')}
          width={200}
        />
        <Column
          className="cluster-table-column-access"
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
          width={70}
          render={(_: any, record: ClusterTableRow) => {
            const editing = isEditing(record);
            if (editing) {
              return (
                <Button onClick={() => save(record.name)} type="default">
                  Done
                </Button>
              );
            }
            return (
              <span
                className="edit-span-btn"
                onClick={e => {
                  e.stopPropagation();
                  edit(record);
                }}
              >
                <S.EditOutlined />
              </span>
            );
          }}
        />
      </S.Table>
    </Form>
  );
};
