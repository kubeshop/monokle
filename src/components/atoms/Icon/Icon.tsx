// eslint-disable-next-line import/no-named-default
import {default as AntdIcon} from '@ant-design/icons';

import Colors from '@styles/Colors';

import {Collapse, Kubernetes} from './Icons';

type IconProps = {
  name: string;
  color?: Colors;
};

type IconsHashTable = {
  [name: string]: () => JSX.Element;
};

const icons: IconsHashTable = {
  kubernetes: Kubernetes,
  collapse: Collapse,
};

const Icon: React.FC<IconProps> = props => {
  const {name, color = Colors.whitePure} = props;

  return <AntdIcon component={icons[name]} style={{color}} />;
};

export default Icon;
