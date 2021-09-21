import React from 'react';
import {Dropdown} from 'antd';
import styled from 'styled-components';
import {FormOutlined} from '@ant-design/icons';
import {NavSectionItemCustomComponentProps} from '@models/navsection';
import {K8sResource} from '@models/k8sresource';
import ActionsMenu from '@components/molecules/NavigatorRowLabel/ActionsMenu';
import {useAppSelector} from '@redux/hooks';
import {isInPreviewModeSelector} from '@redux/selectors';
import {useSelector} from 'react-redux';
import Colors from '@styles/Colors';

const StyledActionsMenuIconContainer = styled.span<{isSelected: boolean}>`
  color: ${props => (props.isSelected ? Colors.blackPure : Colors.whitePure)};
  cursor: pointer;
`;

const StyledActionsMenuIcon = styled(FormOutlined)`
  font-size: 14px;
  padding: 0 10px;
`;

const ContextMenu = (props: NavSectionItemCustomComponentProps<K8sResource>) => {
  const {item, isItemHovered, isItemSelected} = props;
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  if (!isItemHovered) {
    return null;
  }

  return (
    <Dropdown
      overlay={
        <ActionsMenu
          resource={item}
          resourceMap={resourceMap}
          isInPreviewMode={isInPreviewMode}
          previewType={previewType}
        />
      }
      trigger={['click']}
      placement="bottomCenter"
      overlayStyle={{width: 100}}
    >
      <StyledActionsMenuIconContainer isSelected={isItemSelected}>
        <StyledActionsMenuIcon />
      </StyledActionsMenuIconContainer>
    </Dropdown>
  );
};

export default ContextMenu;
