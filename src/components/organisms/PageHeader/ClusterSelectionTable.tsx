import React, {FC, useEffect, useState} from 'react';

import {Button, Form, Tooltip} from 'antd';
import Column from 'antd/lib/table/Column';

import {TOOLTIP_DELAY} from '@constants/constants';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {setCurrentContext, updateProjectKubeAccess} from '@redux/reducers/appConfig';
import {kubeConfigContextSelector, kubeConfigContextsSelector} from '@redux/selectors';

import FilePatternList from '@molecules/FilePatternList';

import {runCommandInMainThread} from '@utils/command';
import {addNamespaces, getKubeAccess, getNamespaces} from '@utils/kubeclient';

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
  const clusterAccess = useAppSelector(state => state.config.projectConfig?.clusterAccess);

  const [localClusters, setLocalClusters] = useState<ClusterTableRow[]>([]);

  useEffect(() => {
    const clusterTableRows: ClusterTableRow[] = kubeConfigContexts.map(context => {
      const contextNamespaces = getNamespaces().filter(appNs => appNs.clusterName === context.name);
      const clusterSpecificAccess = clusterAccess?.filter(ca => ca.context === context.name) || [];
      const hasFullAccess = clusterSpecificAccess.length
        ? clusterSpecificAccess?.every(ca => ca.hasFullAccess)
        : undefined;
      return {
        namespaces: contextNamespaces.map(ctxNs => ctxNs.namespaceName),
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

    const otherClusterNamespaces = getNamespaces().filter(appNs => appNs.clusterName !== clusterName);
    const existingClusterNamespaces = localCluster.namespaces.map(ns => ({
      namespaceName: ns,
      clusterName,
    }));

    addNamespaces([...otherClusterNamespaces, ...existingClusterNamespaces]);

    if (clusterName === kubeConfigContext) {
      try {
        dispatch(updateProjectKubeAccess(localCluster.namespaces.map(ns => getKubeAccess(ns, kubeConfigContext))));
      } catch (e) {
        dispatch(
          setAlert({
            title: 'Cluster access failed',
            message: "Couldn't get cluster access for namespaces",
            type: AlertEnum.Warning,
            duration: 100000,
          })
        );
      }
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

    runCommandInMainThread({
      cmd: `kubectl`,
      args: ['config', 'use-context', clusterName],
    }).then(() => {
      dispatch(setCurrentContext(clusterName));
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
