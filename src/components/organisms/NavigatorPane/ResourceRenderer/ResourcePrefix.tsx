import {memo, useCallback} from 'react';

import {Button, Popover, Tag as RawTag} from 'antd';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {extendResourceFilter, selectResource} from '@redux/reducers/main';
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
import {Colors} from '@shared/styles/colors';
import {isEqual} from '@shared/utils/isEqual';
import {trackEvent} from '@shared/utils/telemetry';

type Props = {
  resourceMeta: ResourceMeta;
  isSelected: boolean;
};

const Prefix = (props: Props) => {
  const {resourceMeta, isSelected} = props;

  const dispatch = useAppDispatch();
  const activeResourceMetaMapRef = useActiveResourceMetaMapRef();
  const activeResourceStorageRef = useRefSelector(activeResourceStorageSelector);
  const selectedResourceRef = useSelectedResourceRef();
  const hasFilterNamespaces = useAppSelector(state => Boolean(state?.main?.resourceFilter?.namespaces?.length));

  const {level, errors, warnings} = useValidationLevel(resourceMeta.id);

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
        level={level}
        results={[...errors, ...warnings]}
        onMessageClickHandler={onMessageClickHandler}
        popoverIconStyle={{transform: 'translateY(-2px)'}}
      />

      <ResourceRefsIconPopover isDisabled={false} isSelected={isSelected} resourceMeta={resourceMeta} type="incoming" />

      {resourceMeta.namespace && !hasFilterNamespaces && (
        <Popover
          mouseEnterDelay={TOOLTIP_DELAY}
          title="Filter"
          overlayClassName="resource-prefix-popover-overlay"
          content={
            <Button type="link" onClick={applyNamespaceFilter} style={{padding: 0}}>
              Set namespace filter to {resourceMeta.namespace}
            </Button>
          }
        >
          <Tag $isSelected={isSelected} color="default">
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
  gap: 2px;

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
