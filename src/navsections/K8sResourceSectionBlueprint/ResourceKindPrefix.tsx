import {useCallback} from 'react';

import {Button, Popover, Tag as RawTag} from 'antd';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {extendResourceFilter} from '@redux/reducers/main';
import {resourceMetaSelector} from '@redux/selectors/resourceSelectors';

import {ResourceRefsIconPopover, ValidationPopover} from '@molecules';

import {useValidationLevel} from '@hooks/useValidationLevel';

import {ItemCustomComponentProps} from '@shared/models/navigator';
import {Colors} from '@shared/styles/colors';

const Prefix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();

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

  if (!resourceMeta) {
    return null;
  }

  return (
    <Container>
      <ValidationPopover disabled={itemInstance.isDisabled} level={level} results={[...warnings, ...errors]} />

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

export default Prefix;

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
