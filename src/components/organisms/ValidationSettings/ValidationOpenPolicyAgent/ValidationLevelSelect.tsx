import {Select, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ValidationLevelSelectTooltip} from '@constants/tooltips';

import type {Rule} from '@shared/models/validation';

import * as S from './ValidationLevelSelect.styled';

type IProps = {
  rule: Rule;
  disabled: boolean;
  handleChange: (rule: Rule, level: 'warning' | 'error') => void;
};

const ValidationLevelSelect: React.FC<IProps> = props => {
  const {disabled, rule, handleChange} = props;

  return (
    <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ValidationLevelSelectTooltip}>
      <Select
        disabled={disabled}
        style={{width: 52, overflow: 'hidden', whiteSpace: 'nowrap'}}
        dropdownStyle={{minWidth: 175}}
        value={rule.level}
        onChange={level => handleChange(rule, level)}
        options={[
          {
            value: 'error',
            label: (
              <S.IndicatorBox>
                <S.Indicator>
                  <S.ProblemIndicator $level="error" />
                </S.Indicator>
                <S.Label>
                  error
                  {rule.defaultLevel === 'error' ? <S.Default>default</S.Default> : ''}
                </S.Label>
              </S.IndicatorBox>
            ),
          },
          {
            value: 'warning',
            label: (
              <S.IndicatorBox>
                <S.Indicator>
                  <S.ProblemIndicator $level="warning" />
                </S.Indicator>
                <S.Label>
                  warning
                  {rule.defaultLevel === 'warning' ? <S.Default>default</S.Default> : ''}
                </S.Label>
              </S.IndicatorBox>
            ),
          },
        ]}
      />
    </Tooltip>
  );
};

export default ValidationLevelSelect;
