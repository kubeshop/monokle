import {Select, Tooltip} from 'antd';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';

import {ProblemIcon} from '@monokle/components';
import {Colors} from '@shared/styles/colors';

import {Rule} from './ValidationCustomTable';

type IProps = {
  rule: Rule;
  disabled: boolean;
  handleChange: (rule: Rule, level: 'warning' | 'error') => void;
};

const ValidationLevelSelect: React.FC<IProps> = props => {
  const {rule, disabled, handleChange} = props;

  return (
    <Tooltip
      mouseEnterDelay={TOOLTIP_DELAY}
      title="Select how you want the violation of this rule to be highlighted in your code."
    >
      <Select
        size="small"
        disabled={disabled}
        style={{width: 52, overflow: 'hidden', whiteSpace: 'nowrap'}}
        dropdownStyle={{minWidth: 175}}
        value={rule.level}
        onChange={level => handleChange(rule, level)}
        options={[
          {
            value: 'error',
            label: (
              <IndicatorBox>
                <Indicator>
                  <ProblemIcon level="error" />
                </Indicator>
                <Label>
                  error
                  {rule.defaultLevel === 'error' ? <Default>default</Default> : ''}
                </Label>
              </IndicatorBox>
            ),
          },
          {
            value: 'warning',
            label: (
              <IndicatorBox>
                <Indicator>
                  <ProblemIcon level="warning" />
                </Indicator>
                <Label>
                  warning
                  {rule.defaultLevel === 'warning' ? <Default>default</Default> : ''}{' '}
                </Label>
              </IndicatorBox>
            ),
          },
        ]}
      />
    </Tooltip>
  );
};

export default ValidationLevelSelect;

// Styled Components

const IndicatorBox = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  gap: 5px;
`;

const Indicator = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  flex: 0 0 20px;
`;

const Label = styled.div`
  display: flex;
  gap: 3px;
  align-items: baseline;
  flex: 1 1 auto;
  min-width: 0px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
`;

const Default = styled.span`
  display: block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 9px;
  margin-left: 3px;
  margin-right: 2px;
  color: ${Colors.grey7};
`;
