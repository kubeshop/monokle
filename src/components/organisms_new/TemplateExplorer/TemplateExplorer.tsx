import {Collapse} from 'antd';

import {isEmpty} from 'lodash';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@monokle/components';

import TemplateCollapseHeader from './TemplateCollapseHeader';
import * as S from './TemplateExplorer.styled';
import TitleBarDescription from './TitleBarDescription';

const TemplateExplorer: React.FC = () => {
  const isOpen = useAppSelector(state => state.ui.templateExplorer.isVisible);
  const pluginMap = useAppSelector(state => state.extension.pluginMap);

  return (
    <S.Modal centered open={isOpen} width="85%" title="Create resources from a template" footer={null}>
      <S.LeftContainer>
        <TitleBar title="Templates" description={<TitleBarDescription />} />

        {!isEmpty(pluginMap) ? (
          <S.TemplatesCollapse ghost>
            {Object.entries(pluginMap).map(([path, plugin]) => (
              <Collapse.Panel header={<TemplateCollapseHeader plugin={plugin} />} key={path}>
                Test
              </Collapse.Panel>
            ))}
          </S.TemplatesCollapse>
        ) : (
          <S.NoTemplatesMessage>No templates found.</S.NoTemplatesMessage>
        )}
      </S.LeftContainer>
    </S.Modal>
  );
};

export default TemplateExplorer;
