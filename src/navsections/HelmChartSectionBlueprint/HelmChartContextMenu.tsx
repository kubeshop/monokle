import React from 'react';

import {Menu} from 'antd';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, setSelectingFile} from '@redux/reducers/main';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';

import {Dots} from '@atoms';

import ContextMenu from '@components/molecules/ContextMenu';

import Colors from '@styles/Colors';

import {StyledActionsMenuIconContainer} from '@src/navsections/HelmChartSectionBlueprint/HelmChartContextMenu.styled';

const HelmChartContextMenu: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const onClickShowFile = () => {
    dispatch(setLeftMenuSelection('file-explorer'));
    dispatch(setSelectingFile(true));
    dispatch(selectFile({filePath: itemInstance.id}));
  };

  const menu = (
    <Menu>
      <Menu.Item disabled={isInPreviewMode} key="show_file" onClick={onClickShowFile}>
        Go to file
      </Menu.Item>
    </Menu>
  );

  return (
    <ContextMenu overlay={menu}>
      <StyledActionsMenuIconContainer isSelected={itemInstance.isSelected}>
        <Dots color={itemInstance.isSelected ? Colors.blackPure : undefined} />
      </StyledActionsMenuIconContainer>
    </ContextMenu>
  );
};

export default HelmChartContextMenu;
