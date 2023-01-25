import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@monokle/components';

import * as S from './TemplateExplorer.styled';
import TitleBarDescription from './TitleBarDescription';

const TemplateExplorer: React.FC = () => {
  const isOpen = useAppSelector(state => state.ui.templateExplorer.isVisible);

  return (
    <S.Modal centered open={isOpen} width="85%" title="Create resources from a template" footer={null}>
      <S.LeftContainer>
        <TitleBar title="Templates" description={<TitleBarDescription />} />
      </S.LeftContainer>
    </S.Modal>
  );
};

export default TemplateExplorer;
