import {Button} from 'antd';

import {ApartmentOutlined, CodeOutlined} from '@ant-design/icons';

import {RightMenuSelectionType} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setRightMenuSelection, toggleRightMenu} from '@redux/reducers/ui';

import {useFeatureFlags} from '@utils/features';

import MenuIcon from './MenuIcon';
import * as S from './PaneManagerRightMenu.styled';

const PaneManagerRightMenu: React.FC = () => {
  const {ShowRightMenu, ShowGraphView} = useFeatureFlags();
  const dispatch = useAppDispatch();
  const rightActive = useAppSelector(state => state.ui.rightMenu.isActive);
  const rightMenuSelection = useAppSelector(state => state.ui.rightMenu.selection);

  const setRightActiveMenu = (selectedMenu: RightMenuSelectionType) => {
    if (!ShowRightMenu) return;

    if (rightMenuSelection === selectedMenu) {
      dispatch(toggleRightMenu());
    } else {
      dispatch(setRightMenuSelection(selectedMenu));
      if (!rightActive) {
        dispatch(toggleRightMenu());
      }
    }
  };

  return (
    <S.Container id="RightRoolbar">
      <Button
        size="large"
        type="text"
        onClick={() => setRightActiveMenu('graph')}
        icon={<MenuIcon icon={ApartmentOutlined} active={rightActive} isSelected={rightMenuSelection === 'graph'} />}
        style={{display: ShowGraphView ? 'inline' : 'none'}}
      />

      <Button
        size="large"
        type="text"
        onClick={() => setRightActiveMenu('logs')}
        icon={<MenuIcon icon={CodeOutlined} active={rightActive} isSelected={rightMenuSelection === 'logs'} />}
      />
    </S.Container>
  );
};

export default PaneManagerRightMenu;
