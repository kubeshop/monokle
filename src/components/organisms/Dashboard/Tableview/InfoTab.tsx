import {useCallback, useMemo} from 'react';

import {Tag} from 'antd';

import {K8sResource, ResourceRef, ResourceRefType} from '@models/k8sresource';
import {MonacoRange} from '@models/ui';

import {setActiveDashboardMenu, setActiveTab, setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, selectK8sResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {isKustomizationResource} from '@redux/services/kustomize';
import {areRefPosEqual} from '@redux/services/resource';
import {isIncomingRef, isOutgoingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';

import RefLink from '@components/molecules/ResourceRefsIconPopover/RefLink';
import {getRefKind} from '@components/molecules/ResourceRefsIconPopover/RefsPopoverContent';

import {isDefined} from '@utils/filter';
import {getRefRange} from '@utils/refs';
import {FOLLOW_LINK, trackEvent} from '@utils/telemetry';
import {timeAgo} from '@utils/timeAgo';

import * as S from './InfoTab.styled';
import * as TableStyle from './TableCells.styled';

export const InfoTab = ({resourceId}: {resourceId: string}) => {
  const resource: K8sResource = useAppSelector(state => state.main.resourceMap[resourceId]);

  return (
    <>
      {resource && (
        <S.Container>
          {resource.namespace && <Namespace namespace={resource.namespace} />}
          {resource.content?.metadata?.labels && <Labels labels={resource.content?.metadata?.labels} />}
          {resource?.content?.metadata?.annotations && (
            <Annotations annotations={resource?.content?.metadata?.annotations} />
          )}
          {resource.content?.spec?.nodeName && <NodeName name={resource.content?.spec?.nodeName} />}
          {resource.content?.status?.phase && <Phase phase={resource.content?.status?.phase} />}
          {resource.content?.metadata?.labels && <Roles labels={resource.content?.metadata?.labels} />}
          {resource.content?.status?.nodeInfo?.kubeletVersion && (
            <KubernetesVersion version={resource.content?.status?.nodeInfo?.kubeletVersion} />
          )}
          {resource.content?.status?.nodeInfo?.containerRuntimeVersion && (
            <ContainerRuntimeVersion version={resource.content?.status?.nodeInfo?.containerRuntimeVersion} />
          )}
          <RefLinks type="incoming" resource={resource} />
          <RefLinks type="outgoing" resource={resource} />
          {resource.content?.metadata?.creationTimestamp && (
            <CreationTimestamp time={resource.content.metadata.creationTimestamp} />
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
      <S.Title>Annotations</S.Title>
      <div>
        {Object.keys(annotations).map(key => (
          <Tag key={`${key}=${annotations[key]}`} color="geekblue" style={{marginBottom: '4px'}}>
            {key}={annotations[key]}
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
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const previewType = useAppSelector(state => state.main.previewType);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);

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

  const isRefLinkDisabled = useCallback(
    (ref: ResourceRef) => {
      if (previewType === 'kustomization' && ref.target?.type === 'resource') {
        const targetResourceId = ref.target.resourceId;
        const targetResource = targetResourceId ? resourceMap[targetResourceId] : undefined;
        if (isKustomizationResource(targetResource) && targetResourceId !== previewResourceId) {
          return true;
        }
      }
      return false;
    },
    [resourceMap, previewResourceId, previewType]
  );

  const processedRefsWithKeys: Array<{ref: ResourceRef; key: string}> | undefined = useMemo(() => {
    return (
      resourceRefs &&
      resourceRefs
        .sort((a, b) => {
          let kindA = getRefKind(a, resourceMap);
          let kindB = getRefKind(b, resourceMap);

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
  }, [resourceRefs, resourceMap]);

  const selectResource = (selectedId: string) => {
    if (resourceMap[selectedId]) {
      dispatch(selectK8sResource({resourceId: selectedId}));
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
    trackEvent(FOLLOW_LINK, {type: ref.type});

    if (ref.type !== ResourceRefType.Incoming) {
      if (selectedResourceId !== resource.id) {
        selectResource(resource.id);
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
      const targetResource = resourceMap[ref.target.resourceId];
      if (!targetResource) {
        return;
      }

      if (selectedResourceId !== targetResource.id) {
        selectResource(targetResource.id);
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
      if (selectedPath !== ref.target.filePath) {
        selectFilePath(ref.target.filePath);
      }
    }
  };

  const handleLinkClickForDashboard = (ref: ResourceRef) => {
    if (ref.target?.type === 'resource') {
      if (!ref.target.resourceId) {
        return;
      }
      const targetResource = resourceMap[ref.target.resourceId];
      if (!targetResource) {
        return;
      }
      selectForDashboard(targetResource);
      return;
    }
    selectForDashboard(resource);
    dispatch(setActiveTab('Manifest'));
  };

  const selectForDashboard = (r: K8sResource) => {
    dispatch(setSelectedResourceId(r.id));
    dispatch(
      setActiveDashboardMenu({
        key: `${r.content.apiVersion}-${r.content.kind}`,
        label: r.content.kind,
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
              isDisabled={isRefLinkDisabled(ref)}
              resourceRef={ref}
              resourceMap={resourceMap}
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
