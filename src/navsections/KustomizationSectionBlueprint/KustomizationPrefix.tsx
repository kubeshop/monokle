import {useCallback} from 'react';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {activeResourceStorageSelector, useActiveResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {useResourceMeta, useSelectedResourceRef} from '@redux/selectors/resourceSelectors';

import {ResourceRefsIconPopover} from '@molecules';

import {useValidationLevel} from '@hooks/useValidationLevel';

import {useRefSelector} from '@utils/hooks';

import {ValidationPopover} from '@monokle/components';
import {ValidationResult, getResourceId, getResourceLocation} from '@monokle/validation';
import {ItemCustomComponentProps} from '@shared/models/navigator';
import {MonacoRange} from '@shared/models/ui';
import {trackEvent} from '@shared/utils/telemetry';

const Prefix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();
  const activeResourceMetaMapRef = useActiveResourceMetaMapRef();
  const activeResourceStorageRef = useRefSelector(activeResourceStorageSelector);
  const selectedResourceRef = useSelectedResourceRef();

  const resourceMeta = useResourceMeta({id: itemInstance.id, storage: itemInstance.meta?.resourceStorage});

  const {level, errors, warnings} = useValidationLevel(itemInstance.id);

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
    </Container>
  );
};

export default Prefix;

// Styled Components

const Container = styled.span`
  display: flex;
  align-items: center;
  & .ant-popover-inner-content {
    padding: 0 !important;
  }
`;
