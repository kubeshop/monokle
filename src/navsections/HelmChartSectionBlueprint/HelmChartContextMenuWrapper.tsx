import React from 'react';

import {Menu} from 'antd';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, setSelectingFile} from '@redux/reducers/main';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';

import ContextMenu from '@components/molecules/ContextMenu';

const HelmChartContextMenu: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance, children} = props;

  const dispatch = useAppDispatch();
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const onClickShowFile = () => {
    dispatch(setLeftMenuSelection('file-explorer'));
    dispatch(setSelectingFile(true));
    dispatch(selectFile({filePath: itemInstance.meta.filePath || itemInstance.id}));
  };

  const menu = (
    <Menu>
      <Menu.Item disabled={isInPreviewMode} key="show_file" onClick={onClickShowFile}>
        Go to file
      </Menu.Item>
    </Menu>
  );

  return (
    <ContextMenu overlay={menu} triggerOnRightClick>
      {children}
    </ContextMenu>
  );
};

export default HelmChartContextMenu;
