import React, {useCallback, useMemo} from 'react';

import {ResourceMapType} from '@models/appstate';
import {K8sResource, ResourceRef, ResourceRefType} from '@models/k8sresource';
import {MonacoRange} from '@models/ui';

import {setActiveDashboardMenu, setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, selectK8sResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {isKustomizationResource} from '@redux/services/kustomize';
import {areRefPosEqual} from '@redux/services/resource';

import {getRefRange} from '@utils/refs';
import {trackEvent} from '@utils/telemetry';

import RefLink from './RefLink';
import * as S from './RefsPopoverContent.styled';

export const getRefKind = (ref: ResourceRef, resourceMap: ResourceMapType) => {
  if (ref.target?.type === 'file') {
    return 'File';
  }

  if (ref.target?.type === 'resource') {
    if (ref.target.resourceKind) {
      return ref.target.resourceKind;
    }
    if (ref.target.resourceId) {
      return resourceMap[ref.target.resourceId]?.kind;
    }
  }
};

const RefsPopoverContent = (props: {children: React.ReactNode; resource: K8sResource; resourceRefs: ResourceRef[]}) => {
  const {children, resourceRefs, resource} = props;
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const previewType = useAppSelector(state => state.main.previewType);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);

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

  const processedRefsWithKeys = useMemo(() => {
    return resourceRefs
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
      });
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

  return (
    <S.Container>
      <S.PopoverTitle>{children}</S.PopoverTitle>

      <S.Divider />

      {processedRefsWithKeys.map(({ref, key}) => (
        <S.RefDiv key={key}>
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
    </S.Container>
  );
};
export default RefsPopoverContent;
