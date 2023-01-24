import {useCallback} from 'react';

import {Button, Popover, Tag} from 'antd';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {extendResourceFilter} from '@redux/reducers/main';
import {resourceMetaSelector} from '@redux/selectors';

import {ResourceRefsIconPopover} from '@molecules';

import {ItemCustomComponentProps} from '@shared/models/navigator';
import {Colors} from '@shared/styles/colors';

const Container = styled.span`
  display: flex;
  align-items: center;
  & .ant-popover-inner-content {
    padding: 0 !important;
  }
`;

const StyledTag = styled(Tag)<{$isSelected: boolean}>`
  margin: 1px 5px 1px 0px;
  color: ${props => (props.$isSelected ? Colors.blackPure : Colors.whitePure)};
  font-weight: ${props => (props.$isSelected ? 700 : undefined)};
  font-size: 12px;
  padding: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Prefix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();
  const resourceMeta = useAppSelector(state =>
    resourceMetaSelector(state, itemInstance.id, itemInstance.meta?.resourceStorage)
  );
  const filterNamespace = useAppSelector(state => state.main.resourceFilter.namespace);

  const applyNamespaceFilter = useCallback(() => {
    if (!resourceMeta) {
      return;
    }
    dispatch(extendResourceFilter({namespace: resourceMeta.namespace, labels: {}, annotations: {}}));
  }, [resourceMeta, dispatch]);

  if (!resourceMeta) {
    return null;
  }

  return (
    <Container>
      <ResourceRefsIconPopover
        isSelected={itemInstance.isSelected}
        isDisabled={itemInstance.isDisabled}
        resourceMeta={resourceMeta}
        type="incoming"
      />
      {resourceMeta.namespace && !filterNamespace && (
        <Popover
          title="Filter"
          overlayClassName="resource-prefix-popover-overlay"
          content={
            <Button type="link" onClick={applyNamespaceFilter} style={{padding: 0}}>
              Set namespace filter to {resourceMeta.namespace}
            </Button>
          }
        >
          <StyledTag $isSelected={itemInstance.isSelected} color="default">
            {resourceMeta.namespace}
          </StyledTag>
        </Popover>
      )}
    </Container>
  );
};

export default Prefix;
