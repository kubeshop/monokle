import {useCallback} from 'react';
import {useMeasure} from 'react-use';

import {Space, Switch, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch} from '@redux/hooks';
import {toggleRule, toggleValidation} from '@redux/validation/validation.slice';

import {PluginMetadataWithConfig} from '@monokle/validation';
import {trackEvent} from '@shared/utils/telemetry';

import * as S from './ValidationCustom.styled';
import ValidationCustomTable from './ValidationCustomTable';
import ValidationHeading from './ValidationHeading';

const ValidationCustom: React.FC<PluginMetadataWithConfig> = props => {
  const {
    id,
    name,
    configuration: {enabled},
  } = props;

  const dispatch = useAppDispatch();

  const [boxRef, {height: boxHeight}] = useMeasure<HTMLDivElement>();
  const [descriptionRef, {height: descriptionHeight}] = useMeasure<HTMLDivElement>();

  const toggleEnabled = useCallback(() => {
    dispatch(toggleValidation(id));
    trackEvent('configure/toggle_validation', {id});
  }, [dispatch, id]);

  const enableAllRules = useCallback(() => {
    dispatch(toggleRule({plugin: name, enable: true}));
    trackEvent('configure/toggle_rule', {id: `enable-${id}`});
  }, [dispatch, id, name]);

  const disableAllRules = useCallback(() => {
    dispatch(toggleRule({plugin: name, enable: false}));
    trackEvent('configure/toggle_rule', {id: `disable-${id}`});
  }, [dispatch, id, name]);

  return (
    <div ref={boxRef} style={{height: 'calc(100% - 40px)'}}>
      <div ref={descriptionRef}>
        <ValidationHeading {...props} />
        <S.DescriptionContainer>
          <S.Description>{props.description}</S.Description>

          <S.DescriptionActions>
            <Tooltip
              mouseEnterDelay={TOOLTIP_DELAY}
              title="your active/inactive rules setup below will be remembered even if you disable the plugin."
            >
              <Space size="small">
                <span>Enable plugin</span>
                <Switch
                  size="small"
                  disabled={!enabled}
                  checked={props.configuration.enabled}
                  onChange={toggleEnabled}
                />
              </Space>
            </Tooltip>

            <Space size="large">
              <a onClick={enableAllRules}>Enable all</a>
              <a onClick={disableAllRules}>Disable all</a>
            </Space>
          </S.DescriptionActions>
        </S.DescriptionContainer>
      </div>

      <ValidationCustomTable plugin={props} height={boxHeight - descriptionHeight} />
    </div>
  );
};

export default ValidationCustom;
