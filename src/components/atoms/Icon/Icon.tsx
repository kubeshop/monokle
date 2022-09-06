import React, {useMemo} from 'react';

import AntdIcon, {ExclamationCircleOutlined} from '@ant-design/icons';

import {IconNames} from '@models/icons';

import Colors from '@styles/Colors';

import {
  Collapse,
  Git,
  Helm,
  Images,
  IncomingRefs,
  K8sSchema,
  Kubernetes,
  Kustomize,
  OPAStatus,
  OpenPolicyAgent,
  OutgoingRefs,
  ResourceLinks,
  Search,
  SeverityHigh,
  SeverityLow,
  SeverityMedium,
  Shortcuts,
  Terminal,
  Validation,
  Warning,
  YAMLSyntax,
} from './Icons';

type IconProps = {
  name: IconNames;
  color?: Colors;
  style?: React.CSSProperties;
  className?: string;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};

const icons: Record<IconNames, React.ComponentType<any>> = {
  'opa-status': OPAStatus,
  images: Images,
  'git-ops': Git,
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
  shortcuts: Shortcuts,
  'yaml-syntax': YAMLSyntax,
  'resource-links': ResourceLinks,
  'k8s-schema': K8sSchema,
  search: Search,
  terminal: Terminal,
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
