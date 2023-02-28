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

  const selectedTemplatePath = useAppSelector(state => state.ui.templateExplorer.selectedTemplatePath);
  const template = useAppSelector(state => state.extension.templateMap[path]);

  const onClickHandler = () => {
    dispatch(setSelectedTemplatePath(path));
  };

  return (
    <S.ItemContainer $selected={isEqual(path, selectedTemplatePath)} onClick={onClickHandler}>
      {template.name}
    </S.ItemContainer>
  );
};

export default TemplateCollapseItem;
