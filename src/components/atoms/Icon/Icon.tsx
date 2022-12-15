import React, {useMemo} from 'react';

import AntdIcon, {ExclamationCircleOutlined} from '@ant-design/icons';

import {IconNames} from '@shared/models/icons';
import {Colors} from '@shared/styles/colors';

import {
  CRDs,
  Collapse,
  Compare,
  Dashboard,
  Git,
  GitOps,
  GitProject,
  GitRepository,
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
  SplitView,
  Template,
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
  git: Git,
  'git-ops': GitOps,
  'git-project': GitProject,
  'git-repository': GitRepository,
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
  'split-view': SplitView,
  crds: CRDs,
  compare: Compare,
  dashboard: Dashboard,
  template: Template,
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
