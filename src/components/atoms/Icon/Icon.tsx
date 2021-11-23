import React, {useMemo} from 'react';

import AntdIcon from '@ant-design/icons';

import Colors from '@styles/Colors';

import {Collapse, Helm, Kubernetes, Kustomize} from './Icons';

export type IconNames = 'kubernetes' | 'collapse' | 'helm' | 'kustomize';

type IconProps = {
  name: IconNames;
  color?: Colors;
  style?: React.CSSProperties;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};

const icons: Record<IconNames, () => JSX.Element> = {
  kubernetes: Kubernetes,
  collapse: Collapse,
  helm: Helm,
  kustomize: Kustomize,
};

const Icon: React.FC<IconProps> = props => {
  const {name, style, color, onMouseEnter, onMouseLeave} = props;

  const finalStyle: React.CSSProperties = useMemo(() => {
    const customStyle = style || {};
    const customColor = color || customStyle?.color;
    return {
      ...customStyle,
      color: customColor,
    };
  }, [style, color]);

  return (
    <AntdIcon component={icons[name]} style={finalStyle} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
  );
};

export default Icon;
