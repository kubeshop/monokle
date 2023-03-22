import React, {useCallback, useMemo} from 'react';

import {setActiveDashboardMenu, setDashboardSelectedResourceId} from '@redux/dashboard/slice';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, selectResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {
  activeResourceStorageSelector,
  useActiveResourceMetaMap,
  useResourceMetaMap,
} from '@redux/selectors/resourceMapSelectors';
import {isKustomizationResource} from '@redux/services/kustomize';

import {getRefRange} from '@utils/refs';

import {ResourceRef, ResourceRefType, areRefPosEqual} from '@monokle/validation';
import {ResourceMeta, ResourceMetaMap} from '@shared/models/k8sResource';
import {MonacoRange} from '@shared/models/ui';
import {trackEvent} from '@shared/utils/telemetry';

import RefLink from './RefLink';
import * as S from './RefsPopoverContent.styled';

export const getRefKind = (ref: ResourceRef, resourceMetaMap: ResourceMetaMap) => {
  if (ref.target?.type === 'file') {
    return 'File';
  }

  if (ref.target?.type === 'resource') {
    if (ref.target.resourceKind) {
      return ref.target.resourceKind;
    }
    if (ref.target.resourceId) {
      return resourceMetaMap[ref.target.resourceId]?.kind;
    }
  }
};

const RefsPopoverContent = (props: {
  children: React.ReactNode;
  resource: ResourceMeta;
  resourceRefs: ResourceRef[];
}) => {
  const {children, resourceRefs, resource} = props;
  const dispatch = useAppDispatch();
  const activeResourceMetaMap = useActiveResourceMetaMap();
  const activeResourceStorage = useAppSelector(activeResourceStorageSelector);
  const localResourceMetaMap = useResourceMetaMap('local');
  const fileMap = useAppSelector(state => state.main.fileMap);
  const selection = useAppSelector(state => state.main.selection);
  const preview = useAppSelector(state => state.main.preview);

  const isRefLinkDisabled = useCallback(
    (ref: ResourceRef) => {
      if (preview?.type === 'kustomize' && ref.target?.type === 'resource') {
        const targetResourceId = ref.target.resourceId;
        const targetResourceMeta = targetResourceId ? localResourceMetaMap[targetResourceId] : undefined;
        if (isKustomizationResource(targetResourceMeta) && targetResourceId !== preview.kustomizationId) {
          return true;
        }
      }
      return false;
    },
    [localResourceMetaMap, preview]
  );

  const processedRefsWithKeys = useMemo(() => {
    return resourceRefs
      .sort((a, b) => {
        let kindA = getRefKind(a, activeResourceMetaMap);
        let kindB = getRefKind(b, activeResourceMetaMap);

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
  }, [resourceRefs, activeResourceMetaMap]);

  const triggerSelectResource = (selectedId: string) => {
    if (activeResourceMetaMap[selectedId]) {
      dispatch(selectResource({resourceIdentifier: {id: selectedId, storage: activeResourceStorage}}));
    }
  };

  const selectFilePath = (filePath: string) => {
    if (fileMap[filePath]) {
      dispatch(selectFile({filePath}));
    }
  };

  const makeMonacoSelection = (type: 'resource' | 'file', target: string, range: MonacoRange) => {
    const newMonacoSelection =
      type === 'resource'
        ? {
            type,
            resourceId: target,
            range,
          }
        : {type, filePath: target, range};
    dispatch(
      setMonacoEditor({
        selection: newMonacoSelection,
      })
    );
  };

  const onLinkClick = (ref: ResourceRef) => {
    trackEvent('explore/navigate_resource_link', {type: ref.type});

    if (ref.type !== ResourceRefType.Incoming) {
      if (!selection || (selection?.type === 'resource' && selection.resourceIdentifier.id !== resource.id)) {
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
      const targetResourceMeta = activeResourceMetaMap[ref.target.resourceId];
      if (!targetResourceMeta) {
        return;
      }

      if (selection?.type === 'resource' && selection.resourceIdentifier.id !== targetResourceMeta.id) {
        triggerSelectResource(targetResourceMeta.id);
      }

      const targetOutgoingRef = targetResourceMeta.refs?.find(
        r => r.type === ResourceRefType.Outgoing && r.target?.type === 'resource' && r.target.resourceId === resource.id
      );

      if (!targetOutgoingRef) {
        return;
      }

      const targetOutgoingRefRange = getRefRange(targetOutgoingRef);
      if (targetOutgoingRefRange) {
        makeMonacoSelection('resource', targetResourceMeta.id, targetOutgoingRefRange);
      }
    }
    if (ref.target?.type === 'file') {
      if (selection?.type === 'file' && selection.filePath !== ref.target.filePath) {
        selectFilePath(ref.target.filePath);
      }
    }
  };

  const handleLinkClickForDashboard = (ref: ResourceRef) => {
    if (ref.target?.type === 'resource') {
      if (!ref.target.resourceId) {
        return;
      }
      const targetResourceMeta = activeResourceMetaMap[ref.target.resourceId];
      if (!targetResourceMeta) {
        return;
      }
      selectForDashboard(targetResourceMeta);
      return;
    }
    selectForDashboard(resource);
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

  return (
    <S.Container>
      <S.PopoverTitle>{children}</S.PopoverTitle>

      <S.Divider />

      {processedRefsWithKeys.map(({ref, key}) => (
        <S.RefDiv key={key}>
          <RefLink
            isDisabled={isRefLinkDisabled(ref)}
            resourceRef={ref}
            resourceMetaMap={activeResourceMetaMap}
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
