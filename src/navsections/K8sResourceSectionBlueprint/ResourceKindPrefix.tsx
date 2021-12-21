import {useCallback} from 'react';

import {Button, Popover, Tag} from 'antd';

import styled from 'styled-components';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {extendResourceFilter} from '@redux/reducers/main';

import ResourceRefsIconPopover from '@components/molecules/ResourceRefsIconPopover';

import Colors from '@styles/Colors';

const Container = styled.span`
  display: flex;
  align-items: center;
  & .ant-popover-inner-content {
    padding: 0 !important;
  }
`;

const Prefix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();
  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);
  const filterNamespace = useAppSelector(state => state.main.resourceFilter.namespace);

  const applyNamespaceFilter = useCallback(() => {
    dispatch(extendResourceFilter({namespace: resource.namespace, labels: {}, annotations: {}}));
  }, [resource, dispatch]);

  if (!resource) {
    return null;
  }

  return (
    <Container>
      <ResourceRefsIconPopover
        isSelected={itemInstance.isSelected}
        isDisabled={itemInstance.isDisabled}
        resource={resource}
        type="incoming"
      />
      {resource.namespace && !filterNamespace && (
        <Popover
          title="Filter"
          overlayClassName="resource-prefix-popover-overlay"
          content={
            <Button type="link" onClick={applyNamespaceFilter} style={{padding: 0}}>
              Set namespace filter to {resource.namespace}
            </Button>
          }
        >
          <Tag
            style={{
              marginLeft: 4,
              color: itemInstance.isSelected ? Colors.blackPure : Colors.whitePure,
              fontWeight: itemInstance.isSelected ? 600 : undefined,
            }}
            color="default"
          >
            {resource.namespace}
          </Tag>
        </Popover>
      )}
    </Container>
  );
};

export default Prefix;
