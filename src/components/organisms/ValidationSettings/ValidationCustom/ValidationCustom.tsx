import {useCallback, useLayoutEffect} from 'react';

import {Button, Space, Switch, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {isUsingCloudPolicySelector} from '@redux/validation/validation.selectors';
import {toggleRule, toggleValidation} from '@redux/validation/validation.slice';

import {PluginMetadataWithConfig} from '@monokle/validation';
import {trackEvent} from '@shared/utils/telemetry';

import * as S from './ValidationCustom.styled';
import ValidationCustomTable from './ValidationCustomTable';
import ValidationHeading from './ValidationHeading';

const ValidationCustom: React.FC<PluginMetadataWithConfig> = props => {
  const {
    configuration: {enabled},
    description,
    name,
  } = props;

  const dispatch = useAppDispatch();

  const isUsingCloudPolicy = useAppSelector(isUsingCloudPolicySelector);

  const toggleEnabled = useCallback(() => {
    dispatch(toggleValidation(name));
    trackEvent('configure/toggle_validation', {id: name});
  }, [dispatch, name]);

  const enableAllRules = useCallback(() => {
    dispatch(toggleRule({plugin: name, enable: true}));
    trackEvent('configure/toggle_rule', {id: `enable-${name}`});
  }, [dispatch, name]);

  const disableAllRules = useCallback(() => {
    dispatch(toggleRule({plugin: name, enable: false}));
    trackEvent('configure/toggle_rule', {id: `disable-${name}`});
  }, [dispatch, name]);

  useLayoutEffect(() => {
    document.getElementById('validation-settings-tab')?.scroll({top: 0, behavior: 'smooth'});
  }, []);

  return (
    <div>
      <ValidationHeading {...props} />

      <S.DescriptionContainer>
        <S.Description>{description}</S.Description>

        <S.DescriptionActions>
          <Tooltip
            mouseEnterDelay={TOOLTIP_DELAY}
            title="your active/inactive rules setup below will be remembered even if you disable the plugin."
          >
            <Space size="small">
              <span>Enable plugin</span>

              <Switch disabled={isUsingCloudPolicy} size="small" checked={enabled} onChange={toggleEnabled} />
            </Space>
          </Tooltip>

          <Space size="large">
            <Button type="link" disabled={isUsingCloudPolicy} onClick={enableAllRules}>
              Enable all
            </Button>
            <Button type="link" disabled={isUsingCloudPolicy} onClick={disableAllRules}>
              Disable all
            </Button>
          </Space>
        </S.DescriptionActions>
      </S.DescriptionContainer>

      <ValidationCustomTable plugin={props} />
    </div>
  );
};

export default ValidationCustom;
