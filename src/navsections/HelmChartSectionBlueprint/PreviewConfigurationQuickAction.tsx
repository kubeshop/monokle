import React from 'react';

import {Button, Tooltip} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {NewPreviewConfigurationTooltip} from '@constants/tooltips';

import {SectionCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openPreviewConfigurationEditor} from '@redux/reducers/main';

import Colors from '@styles/Colors';

const SuffixContainer = styled.span`
  display: inline-block;
`;

const ButtonContainer = styled.span`
  display: flex;
  align-items: center;
  padding: 0 4px;
  margin-right: 2px;
  & .ant-btn-sm {
    height: 20px;
    width: 20px;
  }
`;

const PreviewConfigurationNameSuffix: React.FC<SectionCustomComponentProps> = props => {
  const {sectionInstance} = props;
  const isSectionCollapsed = useAppSelector(state => state.navigator.collapsedSectionIds.includes(sectionInstance.id));

  const dispatch = useAppDispatch();

  const onClick = () => {
    dispatch(openPreviewConfigurationEditor({helmChartId: sectionInstance.id.replace('-configurations', '')}));
  };

  return (
    <SuffixContainer>
      <ButtonContainer>
        <Tooltip title={NewPreviewConfigurationTooltip}>
          <Button
            icon={<PlusOutlined />}
            type="link"
            onClick={onClick}
            size="small"
            style={{color: sectionInstance.isSelected && isSectionCollapsed ? Colors.blackPure : undefined}}
          />
        </Tooltip>
      </ButtonContainer>
    </SuffixContainer>
  );
};

export default PreviewConfigurationNameSuffix;
