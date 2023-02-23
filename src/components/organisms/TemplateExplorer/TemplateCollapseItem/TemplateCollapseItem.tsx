import {isEqual} from 'lodash';

import {activeProjectSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setSelectedTemplatePath, setTemplateProjectCreate} from '@redux/reducers/ui';

import * as S from './TemplateCollapseItem.styled';

type IProps = {
  path: string;
};

const TemplateCollapseItem: React.FC<IProps> = props => {
  const {path} = props;

  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const projectCreateData = useAppSelector(state => state.ui.templateExplorer.projectCreate);
  const selectedTemplatePath = useAppSelector(state => state.ui.templateExplorer.selectedTemplatePath);
  const template = useAppSelector(state => state.extension.templateMap[path]);

  const onClickHandler = () => {
    dispatch(setSelectedTemplatePath(path));

    if (activeProject && projectCreateData) {
      dispatch(setTemplateProjectCreate(undefined));
    }
  };

  return (
    <S.ItemContainer $selected={isEqual(path, selectedTemplatePath)} onClick={onClickHandler}>
      {template.name}
    </S.ItemContainer>
  );
};

export default TemplateCollapseItem;
