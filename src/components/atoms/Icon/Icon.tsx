import React, {useMemo} from 'react';

import AntdIcon, {ExclamationCircleOutlined} from '@ant-design/icons';

import Colors from '@styles/Colors';

import {
  Collapse,
  Helm,
  IncomingRefs,
  Kubernetes,
  Kustomize,
  OutgoingRefs,
  SeverityHigh,
  SeverityLow,
  SeverityMedium,
  Validation,
  Warning,
} from './Icons';
import OpenPolicyAgent from './Icons/OpenPolicyAgent';

export type IconNames =
  | 'kubernetes'
  | 'collapse'
  | 'helm'
  | 'kustomize'
  | 'incomingRefs'
  | 'outgoingRefs'
  | 'warning'
  | 'error'
  | 'validation'
  | 'open-policy-agent'
  | 'severity-high'
  | 'severity-medium'
  | 'severity-low';

type IconProps = {
  name: IconNames;
  color?: Colors;
  style?: React.CSSProperties;
  className?: string;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};

const icons: Record<IconNames, React.ComponentType<any>> = {
  kubernetes: Kubernetes,
  collapse: Collapse,
  helm: Helm,
  kustomize: Kustomize,
  incomingRefs: IncomingRefs,
  outgoingRefs: OutgoingRefs,
  warning: Warning,
  error: ExclamationCircleOutlined,
  validation: Validation,
  'open-policy-agent': OpenPolicyAgent,
  'severity-high': SeverityHigh,
  'severity-medium': SeverityMedium,
  'severity-low': SeverityLow,
};

const Icon: React.FC<IconProps> = props => {
  const {name, style, color, onMouseEnter, onMouseLeave, className} = props;

  const finalStyle: React.CSSProperties = useMemo(() => {
    const customStyle = style || {};
    const customColor = color || customStyle?.color;
    return {
      ...customStyle,
      color: customColor,
    };
  }, [style, color]);

  return (
    <AntdIcon
      className={className}
      component={icons[name]}
      style={finalStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

export default Icon;
