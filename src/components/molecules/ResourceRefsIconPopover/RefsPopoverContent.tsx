import React, {useCallback, useMemo} from 'react';
import {K8sResource, ResourceRef, ResourceRefType} from '@models/k8sresource';
import {ResourceMapType} from '@models/appstate';
import styled from 'styled-components';
import {Typography, Divider} from 'antd';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, selectK8sResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {MonacoRange} from '@models/ui';
import {areRefPosEqual} from '@redux/services/resource';
import {KUSTOMIZATION_KIND} from '@constants/constants';
import RefLink from './RefLink';

const {Text} = Typography;

const Container = styled.div`
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  max-height: 350px;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;

const PopoverTitle = styled(Text)`
  font-weight: 500;
`;

const StyledDivider = styled(Divider)`
  margin: 5px 0;
`;

const StyledRefDiv = styled.div`
  display: block;
  margin: 5px 0;
`;

const getRefKind = (ref: ResourceRef, resourceMap: ResourceMapType) => {
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

const getRefRange = (ref: ResourceRef) => {
  if (!ref.position) {
    return undefined;
  }
  return {
    startLineNumber: ref.position.line,
    endLineNumber: ref.position.line,
    startColumn: ref.position.column,
    endColumn: ref.position.column + ref.position.length,
  };
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
        if (targetResource?.kind === KUSTOMIZATION_KIND && targetResourceId !== previewResourceId) {
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
    if (ref.type !== ResourceRefType.Incoming) {
      if (selectedResourceId !== resource.id) {
        selectResource(resource.id);
      }
      const refRange = getRefRange(ref);
      if (refRange) {
        makeMonacoSelection('resource', resource.id, refRange);
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

  return (
    <Container>
      <PopoverTitle>{children}</PopoverTitle>
      <StyledDivider />
      {processedRefsWithKeys.map(({ref, key}) => (
        <StyledRefDiv key={key}>
          <RefLink
            isDisabled={isRefLinkDisabled(ref)}
            resourceRef={ref}
            resourceMap={resourceMap}
            onClick={() => onLinkClick(ref)}
          />
        </StyledRefDiv>
      ))}
    </Container>
  );
};
export default RefsPopoverContent;
