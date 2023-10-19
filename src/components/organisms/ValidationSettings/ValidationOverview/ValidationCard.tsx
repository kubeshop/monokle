import {shell} from 'electron';

import {useCallback, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  isUsingCloudPolicySelector,
  pluginRulesSelector,
  useValidationSelector,
} from '@redux/validation/validation.selectors';
import {toggleValidation, updateSelectedPluginConfiguration} from '@redux/validation/validation.slice';

import {IconNames} from '@monokle/components';
import {PluginMetadataWithConfig} from '@monokle/validation';
import {trackEvent} from '@shared/utils';

import * as S from './ValidationCard.styled';

type Props = {
  plugin: PluginMetadataWithConfig;
  configurable?: boolean;
};

const ValidationCard: React.FC<Props> = ({configurable, plugin}) => {
  const {
    id,
    icon,
    displayName,
    description,
    learnMoreUrl,
    name,
    configuration: {enabled},
  } = plugin;

  const dispatch = useAppDispatch();
  const hasRules = useValidationSelector(s => pluginRulesSelector(s, name).length > 0);

  const isUsingCloudPolicy = useAppSelector(isUsingCloudPolicySelector);

  const [isChecked, setIsChecked] = useState(enabled);

  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl || ''), [learnMoreUrl]);

  const onConfigureHandler = () => {
    dispatch(updateSelectedPluginConfiguration(plugin));
  };

  const toggleEnabled = useCallback(() => {
    setIsChecked(currentIsChecked => !currentIsChecked);
    dispatch(toggleValidation(name));
    trackEvent('configure/toggle_validation', {id: name});
  }, [dispatch, name]);

  return (
    <S.ValidationCardContainer key={id}>
      <S.Icon name={(icon ?? 'plugin-default') as IconNames} key={icon} />

      <S.InfoContainer>
        <S.Name>{displayName}</S.Name>

        <span>
          <S.Description>{description}</S.Description>

          {learnMoreUrl && <S.Link onClick={openLearnMore}>Learn more</S.Link>}
        </span>
      </S.InfoContainer>

      {hasRules && configurable && (
        <S.ConfigureButton type="primary" onClick={onConfigureHandler}>
          {isUsingCloudPolicy ? 'View' : 'Configure'}
        </S.ConfigureButton>
      )}

      <S.Switch disabled={isUsingCloudPolicy} checked={isChecked} size="small" onChange={toggleEnabled} />
    </S.ValidationCardContainer>
  );
};

export default ValidationCard;
