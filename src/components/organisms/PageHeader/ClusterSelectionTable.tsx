import React, {FC, useState} from 'react';

import {Button, Form, Tooltip} from 'antd';
import Column from 'antd/lib/table/Column';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCurrentContext, updateProjectKubeAccess} from '@redux/reducers/appConfig';
import {kubeConfigContextSelector, kubeConfigContextsSelector} from '@redux/selectors';

import FilePatternList from '@molecules/FilePatternList';

import {addNamespaces, getKubeAccess, getNamespaces} from '@utils/kubeclient';

import * as S from './ClusterSelectionTable.styled';

interface CLusterSelectionTableProps {
  setIsClusterDropdownOpen: (isOpen: boolean) => void;
}

interface ClusterTableRow {
  name: string;
  namespaces: string[];
  hasFullAccess: boolean;
  editable: boolean;
}

export const ClusterSelectionTable: FC<CLusterSelectionTableProps> = ({setIsClusterDropdownOpen}) => {
  const dispatch = useAppDispatch();
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContexts = useAppSelector(kubeConfigContextsSelector);

  const clusterTableRows: ClusterTableRow[] = kubeConfigContexts.map(context => {
    const contextNamespaces = getNamespaces().filter(appNs => appNs.clusterName === context.name);
    return {
      namespaces: contextNamespaces.map(ctxNs => ctxNs.namespaceName),
      name: context.name,
      hasFullAccess: true,
      editable: true,
    };
  });

  const [form] = Form.useForm();
  const [localClusters, setLocalClusters] = useState(clusterTableRows);
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

    const otherClusterNamespaces = getNamespaces().filter(appNs => appNs.clusterName !== clusterName);
    const existingClusterNamespaces = localCluster.namespaces.map(ns => ({
      namespaceName: ns,
      clusterName,
    }));

    addNamespaces([...otherClusterNamespaces, ...existingClusterNamespaces]);

    if (clusterName === kubeConfigContext) {
      dispatch(updateProjectKubeAccess(localCluster.namespaces.map(ns => getKubeAccess(ns))));
    }

    setEditingKey('');
  };

  const clusterNamespaceRender = (cluster: ClusterTableRow) => {
    const editing = isEditing(cluster);

    if (editing) {
      return (
        <FilePatternList
          value={cluster.namespaces}
          onChange={ns => onNamespacesChange(cluster.name, ns)}
          tooltip="Add new namespace"
          addButtonLabel="Add namespace"
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

  const onNamespacesChange = (clusterName: string, namespaces: string[]) => {
    const localClusterIndex = localClusters.findIndex(c => c.name === clusterName);
    const localCluster = localClusters[localClusterIndex];
    if (!localCluster) {
      return;
    }

    const otherClusters = localClusters.filter(lc => lc.name !== clusterName);
    const editedCluster = {
      name: clusterName,
      namespaces,
      hasFullAccess: localCluster.hasFullAccess,
      editable: false,
    };
    otherClusters.splice(localClusterIndex, 0, editedCluster);
    setLocalClusters(otherClusters);
  };

  const handleClusterChange = (clusterName: string) => {
    setIsClusterDropdownOpen(false);
    if (clusterName === kubeConfigContext) {
      return;
    }
    dispatch(setCurrentContext(clusterName));
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
          // onCellClick={(cluster : ClusterTableRow) => handleClusterChange(cluster.name)}
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
          render={(value: boolean) => (value ? 'Full Access' : 'Restricted Access')}
          ellipsis
          width={100}
        />
        <Column
          className="table-column-actions"
          key="clusterActions"
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
