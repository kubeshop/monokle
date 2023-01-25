import {useEffect, useState} from 'react';

import {Collapse} from 'antd';

import {isEmpty} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeTemplateExplorer} from '@redux/reducers/ui';

import {TitleBar} from '@monokle/components';

import TemplateCollapseHeader from './TemplateCollapseHeader';
import TemplateCollapseItem from './TemplateCollapseItem';
import * as S from './TemplateExplorer.styled';
import TitleBarDescription from './TitleBarDescription';

const TemplateExplorer: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.templateExplorer.isVisible);
  const pluginMap = useAppSelector(state => state.extension.pluginMap);

  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  useEffect(() => {
    setActiveKeys(Object.keys(pluginMap));
  }, [pluginMap]);

  return (
    <S.Modal
      open={isOpen}
      width="90%"
      title="Create resources from a template"
      footer={null}
      onCancel={() => dispatch(closeTemplateExplorer())}
    >
      <S.LeftContainer>
        <S.PaddingWrapper>
          <TitleBar title="Templates" description={<TitleBarDescription />} />
        </S.PaddingWrapper>

        {!isEmpty(pluginMap) ? (
          <S.TemplatesCollapse
            activeKey={activeKeys}
            ghost
            onChange={keys => {
              setActiveKeys(typeof keys === 'string' ? [keys] : keys);
            }}
          >
            {Object.entries(pluginMap).map(([path, plugin]) => (
              <Collapse.Panel header={<TemplateCollapseHeader plugin={plugin} />} key={path}>
                {plugin.modules.map(module => (
                  <TemplateCollapseItem key={module.path} path={module.path} />
                ))}
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
