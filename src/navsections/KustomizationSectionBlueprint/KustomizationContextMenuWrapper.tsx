import React from 'react';

import {Menu} from 'antd';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, setSelectingFile} from '@redux/reducers/main';
import {setLeftMenuSelection} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';

import ContextMenu from '@components/molecules/ContextMenu';

const KustomizationContextMenu: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance, children} = props;

  const dispatch = useAppDispatch();
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const onClickShowFile = () => {
    const resource = resourceMap[itemInstance.id];

    if (resource) {
      dispatch(setLeftMenuSelection('file-explorer'));
      dispatch(setSelectingFile(true));
      dispatch(selectFile({filePath: resource.filePath}));
    }
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

export default KustomizationContextMenu;
