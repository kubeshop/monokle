import Link from 'antd/lib/typography/Link';

import {useAppDispatch} from '@redux/hooks';
import {closeTemplateExplorer, setActiveSettingsPanel, setStartPageMenuOption} from '@redux/reducers/ui';

import TemplateExplorerDescription from '@assets/TemplateExplorerDescription.svg';

import {SettingsPanel} from '@shared/models/config';

import * as S from './TitleBarDescription.styled';

const TitleBarDescription: React.FC = () => {
  const dispatch = useAppDispatch();

  const onLinkClickHandler = () => {
    dispatch(closeTemplateExplorer());
    dispatch(setStartPageMenuOption('settings'));
    dispatch(setActiveSettingsPanel(SettingsPanel.PluginsManager));
  };

  return (
    <S.Container>
      <img src={TemplateExplorerDescription} />
      <S.Text>
        No need to be a K8s expert anymore! Create resources through easy forms.{' '}
        <Link onClick={onLinkClickHandler}>Install additional templates using Plugins here</Link>
      </S.Text>
    </S.Container>
  );
};

export default TitleBarDescription;
