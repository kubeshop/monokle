import {useAppSelector} from '@redux/hooks';

import * as S from './TemplateExplorer.styled';

const TemplateExplorer: React.FC = () => {
  const isOpen = useAppSelector(state => state.ui.templateExplorer.isVisible);

  return (
    <S.Modal centered open={isOpen} width="85%" title="Create resources from a template" footer={null}>
      <S.LeftContainer>Test</S.LeftContainer>
    </S.Modal>
  );
};

export default TemplateExplorer;
