import {shell} from 'electron';

import {useCallback} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {pluginEnabledSelector} from '@redux/validation/validation.selectors';
import {toggleValidation, updateSelectedPluginConfiguration} from '@redux/validation/validation.slice';

import {ValidationPlugin} from '@shared/models/validationPlugins';
import {trackEvent} from '@shared/utils';

import * as S from './ValidationCard.styled';

type Props = {
  plugin: ValidationPlugin;
};

const ValidationCard: React.FC<Props> = ({plugin}) => {
  const {id, icon, name, description, learnMoreUrl} = plugin;

  const dispatch = useAppDispatch();
  // TODO: fix this pluginEnabledSelector
  const isEnabled = useAppSelector(state => pluginEnabledSelector(state, id));

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  const onConfigureHandler = () => {
    dispatch(updateSelectedPluginConfiguration(plugin));
  };

  const toggleEnabled = useCallback(() => {
    dispatch(toggleValidation(id));
    trackEvent('configure/toggle_validation', {id});
  }, [dispatch, id]);

  return (
    <S.ValidationCardContainer key={id}>
      <S.Icon name={icon} key={icon} />

      <S.InfoContainer>
        <S.Name>{name}</S.Name>

        <span>
          <S.Description>{description}</S.Description>
          <S.Link onClick={openLearnMore}>Learn more</S.Link>
        </span>
      </S.InfoContainer>

      {plugin.isConfigurable && (
        <S.ConfigureButton type="primary" onClick={onConfigureHandler}>
          Configure
        </S.ConfigureButton>
      )}

      {!plugin.disableToggle && <S.Switch checked={isEnabled} size="small" onChange={toggleEnabled} />}
    </S.ValidationCardContainer>
  );
};

export default ValidationCard;
