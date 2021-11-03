// eslint-disable-next-line import/no-named-default
import {default as AntdIcon} from '@ant-design/icons';

import Kubernetes from './Icons/Kubernetes';

type IconProps = {
  name: string;
};

type IconsHashTable = {
  [name: string]: () => JSX.Element;
};

const icons: IconsHashTable = {
  kubernetes: Kubernetes,
};

const Icon: React.FC<IconProps> = props => {
  const {name} = props;

  return <AntdIcon component={icons[name]} />;
};

export default Icon;
