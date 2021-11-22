import React from 'react';

import {Switch, SwitchProps, Typography} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

const {Text} = Typography;

export type MonoSwitchProps = SwitchProps & {
  label: string;
  labelRight?: boolean;
  checkedInnerText?: string;
  unCheckedInnerText?: string;
};

const StyledSwitchContainer = styled.div`
  .ant-switch {
    background-color: ${Colors.grey500};
    padding: '3px 4px 3px 4px';
  }
  .ant-switch-checked {
    background-color: ${Colors.greenOkay};
  }
`;

const StyledSwitch = styled((props: MonoSwitchProps) => (
  <Switch
    {...props}
    checkedChildren={props.checkedInnerText ? <Text italic>{props.checkedInnerText}</Text> : undefined}
    unCheckedChildren={props.unCheckedInnerText ? <Text code>{props.unCheckedInnerText}</Text> : undefined}
  />
))``;

const MonoSwitch = (props: MonoSwitchProps) => {
  const {label} = props;

  return (
    <StyledSwitchContainer>
      <Text style={{fontSize: '0.9em'}}>{label} </Text>
      <StyledSwitch {...props} />
    </StyledSwitchContainer>
  );
};

export default MonoSwitch;
