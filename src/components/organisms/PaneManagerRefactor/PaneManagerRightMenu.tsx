import {Button} from 'antd';

import {ApartmentOutlined, CodeOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setRightMenuSelection, toggleRightMenu} from '@redux/reducers/ui';

import featureJson from '@src/feature-flags.json';

import MenuIcon from './MenuIcon';
import * as S from './PaneManagerRightMenu.styled';

const PaneManagerRightMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const rightActive = useAppSelector(state => state.ui.rightMenu.isActive);
  const rightMenuSelection = useAppSelector(state => state.ui.rightMenu.selection);

  const setRightActiveMenu = (selectedMenu: string) => {
    if (featureJson.ShowRightMenu) {
      if (rightMenuSelection === selectedMenu) {
        dispatch(toggleRightMenu());
      } else {
        dispatch(setRightMenuSelection(selectedMenu));
        if (!rightActive) {
          dispatch(toggleRightMenu());
        }
      }
    }
  };

  return (
    <S.Container>
      <Button
        size="large"
        type="text"
        onClick={() => setRightActiveMenu('graph')}
        icon={<MenuIcon icon={ApartmentOutlined} active={rightActive} isSelected={rightMenuSelection === 'graph'} />}
        style={{display: featureJson.ShowGraphView ? 'inline' : 'none'}}
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
