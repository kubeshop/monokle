import React, {useCallback, useState} from 'react';

import {DownCircleOutlined, UpCircleOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleExpandActionsPaneFooter} from '@redux/reducers/ui';

import * as S from './ActionsPaneFooter.styled';

interface IProps {
  tabs: {[tabKey: string]: {title: string; content: React.ReactNode}};
}

const ActionsPaneFooter: React.FC<IProps> = props => {
  const {tabs} = props;

  const dispatch = useAppDispatch();
  const isExpanded = useAppSelector(state => state.ui.isActionsPaneFooterExpanded);

  const toggleIsExpanded = useCallback(() => dispatch(toggleExpandActionsPaneFooter()), [dispatch]);

  const [activeTab, setActiveTab] = useState<string>();

  const onClickTabLabel = (key: string) => {
    setActiveTab(key);

    if (!isExpanded) {
      toggleIsExpanded();
    }
  };

  return (
    <S.Container>
      <S.TitleBar>
        <S.TitleBarTabs>
          {Object.entries(tabs).map(([key, value]) => (
            <S.TitleLabel
              key={key}
              className={activeTab === key && isExpanded ? 'selected-tab' : ''}
              onClick={() => onClickTabLabel(key)}
            >
              {value.title}
            </S.TitleLabel>
          ))}
        </S.TitleBarTabs>

        <S.TitleIcon onClick={toggleIsExpanded}>
          {isExpanded ? <DownCircleOutlined /> : <UpCircleOutlined />}
        </S.TitleIcon>
      </S.TitleBar>

      {isExpanded && activeTab && <S.Pane>{tabs[activeTab].content}</S.Pane>}
    </S.Container>
  );
};

export default ActionsPaneFooter;
