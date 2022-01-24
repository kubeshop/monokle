import React from 'react';
import {useMeasure} from 'react-use';

import {Tooltip} from 'antd';

import {DeliveredProcedureOutlined} from '@ant-design/icons';

import _ from 'lodash';

import {AnyTemplate} from '@models/template';

import {Icon} from '@components/atoms';

import TemplateIcon from '@assets/TemplateIcon.svg';

import * as S from './TemplateInformation.styled';

interface IProps {
  template: AnyTemplate;
  onClickOpenTemplate: () => void;
  disabled?: boolean;
}

const TemplateInformation: React.FC<IProps> = props => {
  const {template, onClickOpenTemplate, disabled} = props;

  const [infoContainerRef, {width: infoContainerWidth}] = useMeasure<HTMLDivElement>();

  return (
    <S.Container>
      <S.Image src={template.icon ? template.icon : TemplateIcon} alt="Template_Icon" />

      <S.InfoContainer ref={infoContainerRef}>
        <S.Name $width={infoContainerWidth}>{template.name}</S.Name>

        <S.Description>{_.truncate(template.description, {length: 140})}</S.Description>

        <S.AdditionalInformation>
          <span>Author: {template.author}</span>
          <span>Version: {template.version}</span>
        </S.AdditionalInformation>

        <S.Footer>
          <S.OpenButton
            disabled={disabled}
            icon={<DeliveredProcedureOutlined />}
            type="link"
            size="small"
            onClick={onClickOpenTemplate}
          >
            Use Template
          </S.OpenButton>
          {template.type === 'helm-chart' && (
            <Tooltip title="This template requires Helm to run">
              <Icon name="helm" />
            </Tooltip>
          )}
        </S.Footer>
      </S.InfoContainer>
    </S.Container>
  );
};

export default TemplateInformation;
