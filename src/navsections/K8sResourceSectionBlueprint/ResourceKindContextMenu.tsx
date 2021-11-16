import {Dropdown} from 'antd';
import React from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {isInPreviewModeSelector} from '@redux/selectors';

import {ItemCustomComponentProps} from '@models/navigator';

import {Dots} from '@atoms';

import ResourceActionsMenu from '@components/molecules/ResourceActionsMenu';

const StyledActionsMenuIconContainer = styled.span<{isSelected: boolean}>`
  cursor: pointer;
`;

const ContextMenu = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);

  if (!resource) {
    return null;
  }

  return (
    <Dropdown
      overlay={
        <ResourceActionsMenu
          resource={resource}
          resourceMap={resourceMap}
          isInPreviewMode={isInPreviewMode}
          previewType={previewType}
        />
      }
      trigger={['click']}
      placement="bottomCenter"
      overlayStyle={{width: 100}}
    >
      <StyledActionsMenuIconContainer isSelected={itemInstance.isSelected}>
        <Dots />
      </StyledActionsMenuIconContainer>
    </Dropdown>
  );
};

export default ContextMenu;
