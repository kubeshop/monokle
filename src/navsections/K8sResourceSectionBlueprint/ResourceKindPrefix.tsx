import {memo, useCallback} from 'react';

import {Button, Popover, Tag as RawTag} from 'antd';

import {isEqual} from 'lodash';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {extendResourceFilter, selectResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {activeResourceMetaMapSelector, activeResourceStorageSelector} from '@redux/selectors/resourceMapSelectors';
import {resourceMetaSelector, selectedResourceSelector} from '@redux/selectors/resourceSelectors';

import {ResourceRefsIconPopover} from '@molecules';

import {useValidationLevel} from '@hooks/useValidationLevel';

import {useSelectorWithRef} from '@utils/hooks';

import {ValidationPopover} from '@monokle/components';
import {ValidationResult, getResourceId, getResourceLocation} from '@monokle/validation';
import {ItemCustomComponentProps} from '@shared/models/navigator';
import {MonacoRange} from '@shared/models/ui';
import {Colors} from '@shared/styles/colors';
import {trackEvent} from '@shared/utils/telemetry';

const Prefix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();
  const [, activeResourceMetaMapRef] = useSelectorWithRef(activeResourceMetaMapSelector);
  const [, activeResourceStorageRef] = useSelectorWithRef(activeResourceStorageSelector);
  const [, selectedResourceRef] = useSelectorWithRef(selectedResourceSelector);
  const filterNamespaces = useAppSelector(state => state.main.resourceFilter.namespaces);
  const resourceMeta = useAppSelector(state =>
    resourceMetaSelector(state, {id: itemInstance.id, storage: itemInstance.meta?.resourceStorage})
  );

  const {level, errors, warnings} = useValidationLevel(itemInstance.id);

  const applyNamespaceFilter = useCallback(() => {
    if (!resourceMeta) {
      return;
    }
    dispatch(extendResourceFilter({namespaces: [String(resourceMeta.namespace)], labels: {}, annotations: {}}));
  }, [resourceMeta, dispatch]);

  const onMessageClickHandler = useCallback(
    (result: ValidationResult) => {
      trackEvent('explore/navigate_resource_error');

      const resourceId = getResourceId(result) ?? '';
      const location = getResourceLocation(result);
      const region = location.physicalLocation?.region;

      if (selectedResourceRef.current?.id !== resourceId) {
        if (activeResourceMetaMapRef.current[resourceId]) {
          dispatch(selectResource({resourceIdentifier: {id: resourceId, storage: activeResourceStorageRef.current}}));
        }
      }

      if (!region) return;

      const targetOutgoingRefRange: MonacoRange = {
        endColumn: region.endColumn,
        endLineNumber: region.endLine,
        startColumn: region.startColumn,
        startLineNumber: region.startLine,
      };

      dispatch(setMonacoEditor({selection: {type: 'resource', resourceId, range: targetOutgoingRefRange}}));
    },
    [activeResourceMetaMapRef, activeResourceStorageRef, dispatch, selectedResourceRef]
  );

  if (!resourceMeta) {
    return null;
  }

  return (
    <Container>
      <ValidationPopover
        disabled={itemInstance.isDisabled}
        level={level}
        results={[...warnings, ...errors]}
        onMessageClickHandler={onMessageClickHandler}
        popoverIconStyle={{transform: 'translateY(-2px)'}}
      />

      <ResourceRefsIconPopover
        isSelected={itemInstance.isSelected}
        isDisabled={itemInstance.isDisabled}
        resourceMeta={resourceMeta}
        type="incoming"
      />

      {resourceMeta.namespace && !filterNamespaces && (
        <Popover
          title="Filter"
          overlayClassName="resource-prefix-popover-overlay"
          content={
            <Button type="link" onClick={applyNamespaceFilter} style={{padding: 0}}>
              Set namespace filter to {resourceMeta.namespace}
            </Button>
          }
        >
          <Tag $isSelected={itemInstance.isSelected} color="default">
            {resourceMeta.namespace}
          </Tag>
        </Popover>
      )}
    </Container>
  );
};

export default memo(Prefix, isEqual);

// Styled Components

const Container = styled.span`
  display: flex;
  align-items: center;
  & .ant-popover-inner-content {
    padding: 0 !important;
  }
`;

const Tag = styled(RawTag)<{$isSelected: boolean}>`
  margin: 1px 5px 1px 0px;
  color: ${props => (props.$isSelected ? Colors.blackPure : Colors.whitePure)};
  font-weight: ${props => (props.$isSelected ? 700 : undefined)};
  font-size: 12px;
  padding: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
