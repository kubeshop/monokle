import {useMemo} from 'react';

import {Tag} from 'antd';

import {setActiveDashboardMenu, setActiveTab, setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, selectResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {selectedFilePathSelector} from '@redux/selectors';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {useResource, useSelectedResource} from '@redux/selectors/resourceSelectors';

import RefLink from '@components/molecules/ResourceRefsIconPopover/RefLink';
import {getRefKind} from '@components/molecules/ResourceRefsIconPopover/RefsPopoverContent';

import {getRefRange} from '@utils/refs';
import {timeAgo} from '@utils/timeAgo';

import {
  ResourceRef,
  ResourceRefType,
  areRefPosEqual,
  isIncomingRef,
  isOutgoingRef,
  isUnsatisfiedRef,
} from '@monokle/validation';
import {K8sResource, ResourceMeta} from '@shared/models/k8sResource';
import {MonacoRange} from '@shared/models/ui';
import {isDefined} from '@shared/utils/filter';
import {trackEvent} from '@shared/utils/telemetry';

import * as S from './InfoTab.styled';
import * as TableStyle from './TableCells.styled';

export const InfoTab = ({resourceId}: {resourceId: string}) => {
  const resource = useResource({id: resourceId, storage: 'cluster'});

  return (
    <>
      {resource && (
        <S.Container>
          {resource.namespace && <Namespace namespace={resource.namespace} />}
          {resource.object?.metadata?.labels && <Labels labels={resource.object?.metadata?.labels} />}
          {resource?.object?.metadata?.annotations && (
            <Annotations annotations={resource?.object?.metadata?.annotations} />
          )}
          {resource.object?.spec?.nodeName && <NodeName name={resource.object?.spec?.nodeName} />}
          {resource.object?.status?.phase && <Phase phase={resource.object?.status?.phase} />}
          {resource.object?.metadata?.labels && <Roles labels={resource.object?.metadata?.labels} />}
          {resource.object?.status?.nodeInfo?.kubeletVersion && (
            <KubernetesVersion version={resource.object?.status?.nodeInfo?.kubeletVersion} />
          )}
          {resource.object?.status?.nodeInfo?.containerRuntimeVersion && (
            <ContainerRuntimeVersion version={resource.object?.status?.nodeInfo?.containerRuntimeVersion} />
          )}
          <RefLinks type="incoming" resource={resource} />
          <RefLinks type="outgoing" resource={resource} />
          {resource.object?.metadata?.creationTimestamp && (
            <CreationTimestamp time={resource.object.metadata.creationTimestamp} />
          )}
        </S.Container>
      )}
    </>
  );
};

export const Namespace = ({namespace}: {namespace: string}) => {
  return (
    <S.Row>
      <S.Title>Namespace</S.Title>
      <S.BlueContent>{namespace}</S.BlueContent>
    </S.Row>
  );
};

export const Labels = ({labels}: {labels: any}) => {
  return (
    <S.Row>
      <S.Title>Labels</S.Title>
      <div>
        {Object.keys(labels).map(key => (
          <Tag key={`${key}=${labels[key]}`} color="geekblue" style={{marginBottom: '4px'}}>
            {key}={labels[key]}
          </Tag>
        ))}
      </div>
    </S.Row>
  );
};

export const Annotations = ({annotations}: {annotations: any}) => {
  return (
    <S.Row>
      <S.Title style={{marginBottom: '6px'}}>Annotations</S.Title>
      <div>
        {Object.keys(annotations).map(key => (
          <Tag key={`${key}=${annotations[key]}`} color="geekblue" style={{marginBottom: '4px'}}>
            {key}={typeof annotations[key] === 'object' ? JSON.stringify(annotations[key]) : annotations[key]}
          </Tag>
        ))}
      </div>
    </S.Row>
  );
};

export const NodeName = ({name}: {name: string}) => {
  return (
    <S.Row>
      <S.Title>Node selector</S.Title>
      <S.BlueContent>{name}</S.BlueContent>
    </S.Row>
  );
};

export const Phase = ({phase}: {phase: string}) => {
  return (
    <S.Row>
      <S.Title>Status</S.Title>
      {(phase === 'Running' && <TableStyle.StatusRunning>{phase}</TableStyle.StatusRunning>) ||
        (phase === 'Terminating' && <TableStyle.StatusTerminating>{phase}</TableStyle.StatusTerminating>) ||
        (phase === 'Pending' && <TableStyle.StatusPending>{phase}</TableStyle.StatusPending>) ||
        (phase === 'Active' && <TableStyle.StatusActive>{phase}</TableStyle.StatusActive>) || (
          <Tag color="magenta">{phase}</Tag>
        )}
    </S.Row>
  );
};

export const Roles = ({labels}: {labels: any}) => {
  return isDefined(labels['node-role.kubernetes.io/master']) ||
    isDefined(labels['node-role.kubernetes.io/control-plane']) ? (
    <S.Row>
      <S.Title>Roles</S.Title>
      <S.GreyContent>
        {isDefined(labels['node-role.kubernetes.io/master']) && <span>master</span>}
        {isDefined(labels['node-role.kubernetes.io/master']) &&
        isDefined(labels['node-role.kubernetes.io/control-plane']) ? (
          <span>, control-plane</span>
        ) : (
          isDefined(labels['node-role.kubernetes.io/control-plane']) && <span>control-plane</span>
        )}
      </S.GreyContent>
    </S.Row>
  ) : null;
};

export const KubernetesVersion = ({version}: {version: string}) => {
  return (
    <S.Row>
      <S.Title>Kubernetes Version</S.Title>
      <S.GreyContent>{version}</S.GreyContent>
    </S.Row>
  );
};

export const ContainerRuntimeVersion = ({version}: {version: string}) => {
  return (
    <S.Row>
      <S.Title>Container Runtime</S.Title>
      <S.GreyContent>{version}</S.GreyContent>
    </S.Row>
  );
};

export const CreationTimestamp = ({time}: {time: string}) => {
  return (
    <S.Row>
      <S.Title>Created At</S.Title>
      <S.GreyContent>{timeAgo(time)}</S.GreyContent>
    </S.Row>
  );
};

export const RefLinks = ({type, resource}: {type: 'incoming' | 'outgoing'; resource: K8sResource}) => {
  const dispatch = useAppDispatch();
  const clusterResourceMetaMap = useResourceMetaMap('cluster');
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectedResource = useSelectedResource();
  const selectedFilePath = useAppSelector(selectedFilePathSelector);

  const resourceRefs = useMemo(
    () =>
      resource.refs?.filter(r => {
        if (type === 'incoming') {
          return isIncomingRef(r.type);
        }
        return isOutgoingRef(r.type) || isUnsatisfiedRef(r.type);
      }),
    [resource, type]
  );

  // const isRefLinkDisabled = useCallback(
  //   (ref: ResourceRef) => {
  //     // TODO: revisit this logic
  //     // if (preview?.type === 'kustomize' && ref.target?.type === 'resource') {
  //     //   const targetResourceId = ref.target.resourceId;
  //     //   const targetResource = targetResourceId ? clusterResourceMap[targetResourceId] : undefined;
  //     //   if (isKustomizationResource(targetResource) && targetResourceId !== previewResourceId) {
  //     //     return true;
  //     //   }
  //     // }
  //     return false;
  //   },
  //   []
  //   // [resourceMap, previewResourceId, previewType]
  // );

  const processedRefsWithKeys: Array<{ref: ResourceRef; key: string}> | undefined = useMemo(() => {
    return (
      resourceRefs &&
      resourceRefs
        .sort((a, b) => {
          let kindA = getRefKind(a, clusterResourceMetaMap);
          let kindB = getRefKind(b, clusterResourceMetaMap);

          if (kindA && kindB) {
            return kindA.localeCompare(kindB);
          }
          return 0;
        })
        .reduce<ResourceRef[]>((filteredRefs, currentRef) => {
          if (
            filteredRefs.some(
              ref =>
                ref.target?.type === 'resource' &&
                currentRef.target?.type === 'resource' &&
                ref.name === currentRef.name &&
                ref.target.resourceKind === currentRef.target.resourceKind &&
                areRefPosEqual(ref.position, currentRef.position)
            )
          ) {
            return filteredRefs;
          }
          return [...filteredRefs, currentRef];
        }, [])
        .map(ref => {
          let key = ref.name;
          if (ref.target?.type === 'file') {
            key = ref.target.filePath;
          }
          if (ref.target?.type === 'resource') {
            const pos = ref.position;
            const positionString = pos ? `${pos.line}-${pos.column}-${pos.length}` : '';
            if (ref.target.resourceId) {
              key = `${ref.target.resourceId}-${positionString}`;
            } else {
              key = ref.target.resourceKind ? `${ref.target.resourceKind}-${ref.name}-${positionString}` : ref.name;
            }
          }
          if (ref.target?.type === 'image') {
            const pos = ref.position;
            const positionString = pos ? `${pos.line}-${pos.column}-${pos.length}` : '';
            key = `${ref.name}:${ref.target?.tag}-${positionString}`;
          }
          return {ref, key};
        })
    );
  }, [resourceRefs, clusterResourceMetaMap]);

  const triggerSelectResource = (selectedId: string) => {
    if (clusterResourceMetaMap[selectedId]) {
      dispatch(selectResource({resourceIdentifier: {id: selectedId, storage: 'cluster'}}));
    }
  };

  const selectFilePath = (filePath: string) => {
    if (fileMap[filePath]) {
      dispatch(selectFile({filePath}));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const makeMonacoSelection = (type: 'resource' | 'file', target: string, range: MonacoRange) => {
    const selection =
      type === 'resource'
        ? {
            type,
            resourceId: target,
            range,
          }
        : {type, filePath: target, range};
    dispatch(
      setMonacoEditor({
        selection,
      })
    );
  };

  const onLinkClick = (ref: ResourceRef) => {
    trackEvent('explore/navigate_resource_link', {type: ref.type});

    if (ref.type !== ResourceRefType.Incoming) {
      if (selectedResource?.id !== resource.id) {
        // TODO: could this select a resource from another storage?
        triggerSelectResource(resource.id);
      }

      const refRange = getRefRange(ref);

      if (refRange) {
        setImmediate(() => {
          makeMonacoSelection('resource', resource.id, refRange);
        });
      }

      return;
    }

    if (ref.target?.type === 'resource') {
      if (!ref.target.resourceId) {
        return;
      }
      const targetResource = clusterResourceMetaMap[ref.target.resourceId];
      if (!targetResource) {
        return;
      }

      if (selectedResource?.id !== targetResource.id) {
        // TODO: could this select a resource from another storage?
        triggerSelectResource(targetResource.id);
      }

      const targetOutgoingRef = targetResource.refs?.find(
        r => r.type === ResourceRefType.Outgoing && r.target?.type === 'resource' && r.target.resourceId === resource.id
      );

      if (!targetOutgoingRef) {
        return;
      }

      const targetOutgoingRefRange = getRefRange(targetOutgoingRef);
      if (targetOutgoingRefRange) {
        makeMonacoSelection('resource', targetResource.id, targetOutgoingRefRange);
      }
    }
    if (ref.target?.type === 'file') {
      if (selectedFilePath !== ref.target.filePath) {
        selectFilePath(ref.target.filePath);
      }
    }
  };

  const handleLinkClickForDashboard = (ref: ResourceRef) => {
    if (ref.target?.type === 'resource') {
      if (!ref.target.resourceId) {
        return;
      }
      const targetResource = clusterResourceMetaMap[ref.target.resourceId];
      if (!targetResource) {
        return;
      }
      selectForDashboard(targetResource);
      return;
    }
    selectForDashboard(resource);
    dispatch(setActiveTab({tab: 'Manifest', kind: resource.kind}));
  };

  const selectForDashboard = (r: ResourceMeta) => {
    dispatch(setDashboardSelectedResourceId(r.id));
    dispatch(
      setActiveDashboardMenu({
        key: `${r.apiVersion}-${r.kind}`,
        label: r.kind,
      })
    );
  };

  if (processedRefsWithKeys && processedRefsWithKeys.length === 0) {
    return null;
  }

  if (!processedRefsWithKeys) {
    return null;
  }

  return (
    <S.Row>
      <S.Title>{type === 'incoming' ? 'Incoming' : 'Outgoing'} Links</S.Title>
      <S.GreyContent>
        {processedRefsWithKeys.map(({ref, key}, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <S.RefDiv key={index + ref.name + ref.type + key}>
            <RefLink
              isDisabled={false}
              resourceRef={ref}
              resourceMetaMap={clusterResourceMetaMap}
              onClick={(e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                onLinkClick(ref);
                handleLinkClickForDashboard(ref);
              }}
            />
          </S.RefDiv>
        ))}
      </S.GreyContent>
    </S.Row>
  );
};
