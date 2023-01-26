import {isEqual} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setSelectedTemplatePath} from '@redux/reducers/ui';

import * as S from './TemplateCollapseItem.styled';

type IProps = {
  path: string;
};

const TemplateCollapseItem: React.FC<IProps> = props => {
  const {path} = props;

  const dispatch = useAppDispatch();
  const template = useAppSelector(state => state.extension.templateMap[path]);
  const selectedTemplatePath = useAppSelector(state => state.ui.templateExplorer.selectedTemplatePath);

  return (
    <S.ItemContainer
      $selected={isEqual(path, selectedTemplatePath)}
      onClick={() => dispatch(setSelectedTemplatePath(path))}
    >
      {template.name}
    </S.ItemContainer>
  );
};

export default TemplateCollapseItem;
