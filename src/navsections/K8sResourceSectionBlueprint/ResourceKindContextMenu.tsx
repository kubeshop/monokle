import React from 'react';
import {Dropdown} from 'antd';
import styled from 'styled-components';
import {FormOutlined} from '@ant-design/icons';
import ResourceActionsMenu from '@components/molecules/ResourceActionsMenu';
import {useAppSelector} from '@redux/hooks';
import {isInPreviewModeSelector} from '@redux/selectors';
import {useSelector} from 'react-redux';
import Colors from '@styles/Colors';
import {ItemCustomComponentProps} from '@models/navigator';

const StyledActionsMenuIconContainer = styled.span<{isSelected: boolean}>`
  color: ${props => (props.isSelected ? Colors.blackPure : Colors.whitePure)};
  cursor: pointer;
`;

const StyledActionsMenuIcon = styled(FormOutlined)`
  font-size: 14px;
  padding: 0 10px;
`;

const ContextMenu = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);

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
        <StyledActionsMenuIcon />
      </StyledActionsMenuIconContainer>
    </Dropdown>
  );
};

export default ContextMenu;
