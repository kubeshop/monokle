import {useEffect, useMemo, useState} from 'react';
import {useMeasure} from 'react-use';

import {Collapse} from 'antd';

import {debounce, isEmpty} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {closeTemplateExplorer, setTemplateProjectCreate} from '@redux/reducers/ui';

import {useFilteredPluginMap} from '@hooks/useFilteredPluginMap';

import EmptySelectedTemplate from '@assets/EmptySelectedTemplate.svg';

import {SearchInput, TitleBar} from '@monokle/components';

import TemplateCollapseHeader from './TemplateCollapseHeader';
import TemplateCollapseItem from './TemplateCollapseItem';
import * as S from './TemplateExplorer.styled';
import TemplateForm from './TemplateForm';
import TemplateInformation from './TemplateInformation';
import TitleBarDescription from './TitleBarDescription';

const TemplateExplorer: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.templateExplorer.isVisible);
  const pluginMap = useAppSelector(state => state.extension.pluginMap);
  const projectCreateData = useAppSelector(state => state.ui.templateExplorer.projectCreate);
  const selectedTemplatePath = useAppSelector(state => state.ui.templateExplorer.selectedTemplatePath);

  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const [rightContainerRef, {width: rigthContainerWidth}] = useMeasure<HTMLDivElement>();

  const filteredPluginMap = useFilteredPluginMap(searchValue);

  useEffect(() => {
    setActiveKeys(Object.keys(pluginMap));
  }, [pluginMap]);

  const debouncedSetSearchValue = useMemo(() => {
    return debounce(e => {
      setSearchValue(e.target.value);
    }, 500);
  }, []);

  const onCloseHandler = () => {
    dispatch(closeTemplateExplorer());
  };

  useEffect(() => {
    return () => {
      debouncedSetSearchValue.cancel();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <S.Modal open={isOpen} width="90%" title="Create resources from a template" footer={null} onCancel={onCloseHandler}>
      <S.LeftContainer>
        <S.PaddingWrapper>
          <TitleBar title="Templates" description={<TitleBarDescription />} />

          <SearchInput onChange={debouncedSetSearchValue} />
        </S.PaddingWrapper>

        {!isEmpty(filteredPluginMap) ? (
          <S.TemplatesCollapse
            activeKey={activeKeys}
            ghost
            onChange={keys => {
              setActiveKeys(typeof keys === 'string' ? [keys] : keys);
            }}
          >
            {Object.entries(filteredPluginMap).map(([path, plugin]) => (
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

      <S.RightContainer ref={rightContainerRef}>
        {!selectedTemplatePath ? (
          <>
            <S.EmptyImage src={EmptySelectedTemplate} />
            <S.EmptyText>Select your desired template from the list</S.EmptyText>
          </>
        ) : (
          <>
            <TemplateInformation />

            <TemplateForm width={rigthContainerWidth} />
          </>
        )}
      </S.RightContainer>
    </S.Modal>
  );
};

export default TemplateExplorer;
