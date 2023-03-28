import {useCallback} from 'react';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {activeResourceStorageSelector, useActiveResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {useSelectedResourceRef} from '@redux/selectors/resourceSelectors';

import {ResourceRefsIconPopover} from '@molecules';

import {useValidationLevel} from '@hooks/useValidationLevel';

import {useRefSelector} from '@utils/hooks';

import {ValidationPopover} from '@monokle/components';
import {ValidationResult, getResourceId, getResourceLocation} from '@monokle/validation';
import {ResourceMeta} from '@shared/models/k8sResource';
import {MonacoRange} from '@shared/models/ui';
import {trackEvent} from '@shared/utils/telemetry';

type IProps = {
  isDisabled: boolean;
  isSelected: boolean;
  resourceMeta: ResourceMeta;
};

const KustomizePrefix: React.FC<IProps> = props => {
  const {isDisabled, isSelected, resourceMeta} = props;

  const dispatch = useAppDispatch();
  const activeResourceMetaMapRef = useActiveResourceMetaMapRef();
  const activeResourceStorageRef = useRefSelector(activeResourceStorageSelector);
  const selectedResourceRef = useSelectedResourceRef();

  const {level, errors, warnings} = useValidationLevel(resourceMeta.id);

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
        disabled={isDisabled}
        level={level}
        results={[...errors, ...warnings]}
        onMessageClickHandler={onMessageClickHandler}
        popoverIconStyle={{transform: 'translateY(-2px)'}}
      />

      <ResourceRefsIconPopover
        isSelected={isSelected}
        isDisabled={isDisabled}
        resourceMeta={resourceMeta}
        type="incoming"
      />
    </Container>
  );
};

export default KustomizePrefix;

// Styled Components

const Container = styled.span`
  display: flex;
  align-items: center;
  gap: 2px;

  & .ant-popover-inner-content {
    padding: 0 !important;
  }
`;
