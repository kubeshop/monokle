import React from 'react';
import styled from 'styled-components';
import MonokleIncomingRefs from '@assets/MonokleIncomingRefs.svg';
import MonokleOutgoingRefs from '@assets/MonokleOutgoingRefs.svg';
import MonokleWarning from '@assets/MonokleWarning.svg';

export enum MonoIconTypes {
  IncomingRefs,
  OutgoingRefs,
  Warning,
}

export type MonoIconProps = {
  type: MonoIconTypes;
  marginRight?: number;
  marginLeft?: number;
};

const StyledImage = styled.img`
  display: inline-block;
  height: 12px;
`;

const getIconSvg = (type: MonoIconTypes) => {
  switch (type) {
    case MonoIconTypes.IncomingRefs:
      return MonokleIncomingRefs;

    case MonoIconTypes.OutgoingRefs:
      return MonokleOutgoingRefs;

    case MonoIconTypes.Warning:
      return MonokleWarning;

    default:
      return null;
  }
};

const MonoIcon = (props: MonoIconProps) => {
  const {type, marginRight, marginLeft} = props;

  const iconSvg = getIconSvg(type);

  if (iconSvg) {
    return <StyledImage src={iconSvg} style={{marginRight, marginLeft}} alt={MonoIconTypes[type]} />;
  }

  return null;
};

export default MonoIcon;
