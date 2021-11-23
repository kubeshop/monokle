import AntdIcon from '@ant-design/icons';

import Colors from '@styles/Colors';

import {Collapse, Helm, Kubernetes, Kustomize} from './Icons';

type IconTypes = 'kubernetes' | 'collapse' | 'helm' | 'kustomize';

type IconProps = {
  name: IconTypes;
  color?: Colors;
};

const icons: Record<IconTypes, () => JSX.Element> = {
  kubernetes: Kubernetes,
  collapse: Collapse,
  helm: Helm,
  kustomize: Kustomize,
};

const Icon: React.FC<IconProps> = props => {
  const {name, color} = props;

  return <AntdIcon component={icons[name]} style={{color}} />;
};

export default Icon;
