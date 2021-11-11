import {Tag} from 'antd';
import React from 'react';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {isInPreviewModeSelector} from '@redux/selectors';

import Colors, {BackgroundColors} from '@styles/Colors';

const S = {
  Container: styled.div`
    display: flex;
    align-items: center;
  `,
  TitleSpan: styled.span`
    padding: 2px 16px;
    font-size: 24px;
  `,
  PreviewOutputTag: styled(Tag)`
    font-size: 12px;
    font-weight: 600;
    background: ${BackgroundColors.previewModeBackground};
    color: ${Colors.blackPure};
    margin-top: 3px;
  `,
};

function K8sResourceSectionNameDisplay() {
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  return (
    <S.Container>
      <S.TitleSpan>K8s Resources</S.TitleSpan>
      {isInPreviewMode && <S.PreviewOutputTag>Preview Output</S.PreviewOutputTag>}
    </S.Container>
  );
}

export default K8sResourceSectionNameDisplay;
