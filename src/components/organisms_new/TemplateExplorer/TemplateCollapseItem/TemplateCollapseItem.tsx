import {isEqual} from 'lodash';

import {useAppSelector} from '@redux/hooks';

import * as S from './TemplateCollapseItem.styled';

type IProps = {
  path: string;
  selectedTemplatePath?: string;
};

const TemplateCollapseItem: React.FC<IProps> = props => {
  const {path, selectedTemplatePath} = props;

  const template = useAppSelector(state => state.extension.templateMap[path]);

  return <S.ItemContainer $selected={isEqual(path, selectedTemplatePath)}>{template.name}</S.ItemContainer>;
};

export default TemplateCollapseItem;
