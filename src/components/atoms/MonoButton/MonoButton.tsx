import React from 'react';

import {Button, ButtonProps} from 'antd';

import styled from 'styled-components';

export type MonoButtonProps = ButtonProps & {
  large?: React.ReactNode;
};

const MonoButton = styled((props: MonoButtonProps) => (
  <Button
    {...props}
    style={{
      padding: props.large ? '4px 6px 4px 6px' : '3px 4px 3px 4px',
      height: props.large ? '1.7em' : '1.4em',
      fontSize: props.large ? '1em' : '0.7em',
      lineHeight: props.large ? '1em' : '0.7em',
    }}
  />
))``;

export default MonoButton;
