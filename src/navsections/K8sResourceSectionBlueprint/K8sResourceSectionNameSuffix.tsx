import {Tag} from 'antd';
import React from 'react';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {isInPreviewModeSelector} from '@redux/selectors';

import Colors, {BackgroundColors} from '@styles/Colors';

const S = {
  Container: styled.span`
    display: flex;
    align-items: center;
  `,
  PreviewOutputTag: styled(Tag)`
    font-size: 12px;
    font-weight: 600;
    background: ${BackgroundColors.previewModeBackground};
    color: ${Colors.blackPure};
    margin-bottom: 10px;
  `,
};

function K8sResourceSectionNameSuffix() {
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  if (isInPreviewMode) {
    return (
      <S.Container>
        <S.PreviewOutputTag>Preview Output</S.PreviewOutputTag>
      </S.Container>
    );
  }

  return null;
}

export default K8sResourceSectionNameSuffix;
