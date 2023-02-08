import {size} from 'lodash';

import {AnyPlugin} from '@shared/models/plugin';

import * as S from './TemplateCollapseHeader.styled';

type IProps = {
  plugin: AnyPlugin;
};

const TemplateCollapseHeader: React.FC<IProps> = props => {
  const {plugin} = props;

  return (
    <S.HeaderContainer>
      {plugin.name} <S.TemplatesCount>{size(plugin.modules)}</S.TemplatesCount>
    </S.HeaderContainer>
  );
};

export default TemplateCollapseHeader;
