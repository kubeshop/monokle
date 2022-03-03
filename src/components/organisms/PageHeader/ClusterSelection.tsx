import {useCallback, useEffect, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {Dropdown, Tooltip, Form} from 'antd';
import log from 'loglevel';

import {LoadingOutlined} from '@ant-design/icons';
import Column from 'antd/lib/table/Column';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterModeTooltip} from '@constants/tooltips';

import {K8sResource} from '@models/k8sresource';
import {HighlightItems} from '@models/ui';
import {addNamespaces, getKubeAccess, getNamespaces} from '@utils/kubeclient';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCurrentContext, updateProjectConfig, updateProjectKubeAccess} from '@redux/reducers/appConfig';
import {highlightItem, toggleSettings, toggleStartProjectPane} from '@redux/reducers/ui';
import {
  activeProjectSelector,
  isInClusterModeSelector,
  isInPreviewModeSelector,
  kubeConfigContextSelector,
  kubeConfigContextsSelector,
  kubeConfigPathSelector,
  kubeConfigPathValidSelector,
} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import * as S from './ClusterSelection.styled';

interface ClusterTableRow {
  name: string;
  namespaces: string[];
  hasFullAccess: boolean;
  editable: boolean;
}

const ClusterSelection = ({previewResource}: {previewResource?: K8sResource}) => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isClusterSelectorVisible = useAppSelector(state => state.config.isClusterSelectorVisible);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContexts = useAppSelector(kubeConfigContextsSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const clusterAccess = useAppSelector(state => state.config.projectConfig?.clusterAccess);
  const previewType = useAppSelector(state => state.main.previewType);
  const projectConfig = useAppSelector(state => state.config.projectConfig);

  const [isClusterActionDisabled, setIsClusterActionDisabled] = useState(
    Boolean(!kubeConfigPath) || !isKubeConfigPathValid
  );
  const [isClusterDropdownOpen, setIsClusterDropdownOpen] = useState(false);
  const [appNamespaces, setAppNamespaces] = useState(getNamespaces());

  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  useHotkeys('escape', () => {
    setIsClusterDropdownOpen(false);
    dropdownButtonRef.current?.blur();
  });

  const handleClusterChange = (clusterName: string) => {
    setIsClusterDropdownOpen(false);
    if (clusterName === kubeConfigContext) {
      return;
    }
    dispatch(setCurrentContext(clusterName));
    dispatch(
      updateProjectConfig({
        config: {
          ...projectConfig,
          kubeConfig: {
            ...projectConfig?.kubeConfig,
            currentContext: clusterName,
          },
        },
        fromConfigFile: false,
      })
    );
  };

  const handleClusterConfigure = () => {
    dispatch(highlightItem(HighlightItems.CLUSTER_PANE_ICON));
    dispatch(toggleSettings());
    setTimeout(() => {
      dispatch(highlightItem(null));
    }, 3000);
  };

  const connectToCluster = () => {
    if (isInPreviewMode && previewResource && previewResource.id !== kubeConfigPath) {
      stopPreview(dispatch);
    }
    if (kubeConfigPath) {
      startPreview(kubeConfigPath, 'cluster', dispatch);
    }
  };

  const reconnectToCluster = () => {
    if (isInPreviewMode && previewResource && previewResource.id !== kubeConfigPath) {
      stopPreview(dispatch);
    }
    if (kubeConfigPath) {
      restartPreview(kubeConfigPath, 'cluster', dispatch);
    }
  };

  const handleLoadCluster = () => {
    if (isClusterActionDisabled && Boolean(previewType === 'cluster' && previewLoader.isLoading)) {
      return;
    }

    if (isStartProjectPaneVisible) {
      dispatch(toggleStartProjectPane());
    }

    if (isInClusterMode) {
      reconnectToCluster();
    } else {
      connectToCluster();
    }
  };

  useEffect(() => {
    setIsClusterActionDisabled(Boolean(!kubeConfigPath) || !isKubeConfigPathValid);
  }, [kubeConfigPath, isKubeConfigPathValid]);

  const createClusterObjectsLabel = useCallback(() => {
    let content: any;
    let className = '';
    if (isInClusterMode) {
      content = 'RELOAD';
    } else if (previewType === 'cluster' && previewLoader.isLoading) {
      content = <LoadingOutlined />;
    } else {
      content = 'LOAD';
      className = highlightedItems.connectToCluster ? 'animated-highlight' : '';
    }

    return (
      <S.ClusterActionText className={className} $highlighted={highlightedItems.connectToCluster}>
        {content}
      </S.ClusterActionText>
    );
  }, [previewType, previewLoader, isInClusterMode, highlightedItems]);

  const onClusterChange = (clusterName: string, namespaces: string[]) => {
    setIsClusterDropdownOpen(false);
    const otherClusterNamespaces = appNamespaces.filter((appNs) => appNs.clusterName !== clusterName);
    const existingClusterNamespaces = namespaces.map((ns) => ({
      namespaceName: ns,
      clusterName,
    }));

    setAppNamespaces([...otherClusterNamespaces, ...existingClusterNamespaces]);
    addNamespaces([...otherClusterNamespaces, ...existingClusterNamespaces]);

    if (clusterName === kubeConfigContext) {
      dispatch(updateProjectKubeAccess(namespaces.map((ns) => getKubeAccess(ns))));
    }
  };

  const clusterNamespaceRender = (namespaces: string[]) => {
    log.info('ms', namespaces);
    const namespacesTooltip = namespaces.map((ns) => (<span key={ns}>{ns}</span>));
    return (
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={<div>{namespacesTooltip}</div>}>
        <S.ClusterAccessContainer>{namespaces.length}</S.ClusterAccessContainer>
      </Tooltip>
    );
  };

  const clusterTableRows: ClusterTableRow[] = kubeConfigContexts.map((context) => {
    const contextNamespaces = appNamespaces.filter((appNs) => appNs.clusterName === context.name);
    return {
      namespaces: contextNamespaces.map((ctxNs) => ctxNs.namespaceName),
      name: context.name,
      hasFullAccess: true,
      editable: true,
    };
  });

  const [form] = Form.useForm();
  const [data, setData] = useState(clusterTableRows);
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record: ClusterTableRow) => record.name === editingKey;

  const edit = (record: Partial<ClusterTableRow>) => {
    form.setFieldsValue({ name: '', namespaces: [], hasFullAccess: false, ...record });
    setEditingKey(record.name as string);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (clusterName: string) => {
    try {
      const row = (await form.validateFields()) as ClusterTableRow;

      const newData = [...data];
      const index = newData.findIndex(item => clusterName === item.name);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      log.error('Validate Failed:', errInfo);
    }
  };

  const clusterMenu = () => {


    return (
      <Form form={form} component={false}>
        <S.Table
          size="small"
          showSorterTooltip={false}
          dataSource={clusterTableRows}
          pagination={false}
          scroll={{y: 300}}
          rowKey="name"
          onRow={(cluster: ClusterTableRow) => ({
            onClick: () => handleClusterChange(cluster.name),
          })}
        >
          <Column
            className="cluster-table-column-name"
            title="Cluster name"
            dataIndex="name"
            key="name"
            ellipsis
            width={350}
          />
          <Column
            className="cluster-table-column-namespaces"
            title="Namespaces"
            dataIndex="namespaces"
            key="namespaces"
            ellipsis
            render={(value: string[]) => (value ? clusterNamespaceRender(value) : '-')}
            width={100}
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
            className="cluster-table-column-actions"
            ellipsis
            width={100}
            render={(_: any, record: ClusterTableRow) => {
              const editing = isEditing(record);
              if (editing) {
                return (
                  <span onClick={() => save(record.name)}>save</span>
                );
              }
              return (
                <span onClick={() => edit(record)}>edit</span>
              );
            }}
          />
        </S.Table>
      </Form>
    );
    // return (
    //   <S.ClusterDropdownContainer>
    //     {
    //       data.map((x: any) => {
    //         return (
    //           <div key={x.name}>
    //             <S.ClusterDropdownClusterName
    //               onClick={() => handleClusterChange({key: x.name})}
    //             >Cluster: {x.name}</S.ClusterDropdownClusterName>
    //             <span>Namespaces:</span>
    //             <FilePatternList
    //               value={x.namespaces}
    //               onChange={(namespaces) => onClusterChange(x.name, namespaces)}
    //               tooltip="Add new namespace"
    //               addButtonLabel="Add namespace"
    //             />
    //           </div>
    //         );
    //       })
    //     }
    //   </S.ClusterDropdownContainer>
    // );
  };

  if (!isClusterSelectorVisible) {
    return null;
  }

  const clusterAccessInfo = () => {
    const hasFullAccess = clusterAccess?.some((ca) => ca.hasFullAccess);
    if (hasFullAccess) {
      return {
        icon: <S.CheckCircleOutlined />,
        tooltip: 'You have full access to this cluster',
      };
    }

    return {
      icon: <S.ExclamationCircleOutlinedWarning />,
      tooltip: 'You do not have full access to this cluster',
    };
  };

  const {icon, tooltip} = clusterAccessInfo();

  return (
    <S.ClusterContainer id="ClusterContainer">
      {activeProject && (
        <S.ClusterStatus>
          <S.ClusterStatusText connected={isKubeConfigPathValid}>
            <S.ClusterOutlined />
            <span>{isKubeConfigPathValid ? 'Configured' : 'No Cluster Configured'}</span>
            {
              isKubeConfigPathValid &&
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltip}>
                  <S.ClusterAccessContainer>{icon}</S.ClusterAccessContainer>
                </Tooltip>
            }
          </S.ClusterStatusText>

          <S.Divider type="vertical" />

          {isKubeConfigPathValid && (
            <Dropdown
              overlay={clusterMenu}
              overlayClassName="cluster-dropdown-item"
              placement="bottomCenter"
              arrow
              trigger={['click']}
              disabled={previewLoader.isLoading || isInClusterMode}
              visible={isClusterDropdownOpen}
              onVisibleChange={setIsClusterDropdownOpen}
            >
              <S.ClusterButton type="link" ref={dropdownButtonRef}>
                <S.ClusterContextName>{kubeConfigContext}</S.ClusterContextName>
                <S.DownOutlined />
              </S.ClusterButton>
            </Dropdown>
          )}

          {isKubeConfigPathValid ? (
            <>
              <S.Divider type="vertical" />
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} mouseLeaveDelay={0} title={ClusterModeTooltip} placement="right">
                <S.Button type="link" onClick={handleLoadCluster}>
                  {createClusterObjectsLabel()}
                </S.Button>
              </Tooltip>
            </>
          ) : (
            <>
              <S.ClusterActionButton type="link" onClick={handleClusterConfigure}>
                Configure
              </S.ClusterActionButton>
            </>
          )}
        </S.ClusterStatus>
      )}
    </S.ClusterContainer>
  );
};

export default ClusterSelection;
