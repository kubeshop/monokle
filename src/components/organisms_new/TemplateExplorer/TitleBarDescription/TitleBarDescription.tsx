import Link from 'antd/lib/typography/Link';

import TemplateExplorerDescription from '@assets/TemplateExplorerDescription.svg';

import * as S from './TitleBarDescription.styled';

const TitleBarDescription: React.FC = () => {
  return (
    <S.Container>
      <img src={TemplateExplorerDescription} />
      <S.Text>
        No need to be a K8s expert anymore! Create reosurces through easy forms.{' '}
        {/* TODO: Add on click functionality for link */}
        <Link>Install additional templates using Plugins here</Link>
      </S.Text>
    </S.Container>
  );
};

export default TitleBarDescription;
