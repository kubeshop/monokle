import React from 'react';

import {Tooltip} from 'antd';

import {DeliveredProcedureOutlined} from '@ant-design/icons';

import _ from 'lodash';

import {AnyTemplate} from '@models/template';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {handleFavoriteTemplate} from '@redux/reducers/appConfig';

import {Icon} from '@components/atoms';

import TemplateIcon from '@assets/TemplateIcon.svg';

import * as S from './TemplateInformation.styled';

interface IProps {
  template: AnyTemplate;
  onClickOpenTemplate: () => void;
  actionType?: 'link' | 'button';
  actionLabel?: string;
  disabled?: boolean;
}

const TemplateInformation: React.FC<IProps> = props => {
  const {template, onClickOpenTemplate, actionType = 'link', actionLabel, disabled} = props;
  const dispatch = useAppDispatch();
  const favoriteTemplates = useAppSelector(state => state.config.favoriteTemplates);

  const onClickPinTemplate = () => {
    dispatch(handleFavoriteTemplate(template.id));
  };
  return (
    <S.Container $shouldHaveMarginBottom={actionType === 'button'}>
      <S.Image src={template.icon ? template.icon : TemplateIcon} alt="Template_Icon" />

      <S.InfoContainer>
        <S.NameContainer>
          <S.Name>{template.name}</S.Name>
          {template.type === 'helm-chart' && (
            <Tooltip title="This template requires Helm to run">
              <Icon name="helm" />
            </Tooltip>
          )}
          {favoriteTemplates.includes(template.id) ? (
            <S.UnPinTemplateButton onClick={onClickPinTemplate}>
              <DeliveredProcedureOutlined />
            </S.UnPinTemplateButton>
          ) : (
            <S.PinTemplateButton onClick={onClickPinTemplate}>
              <Icon name="helm" />
            </S.PinTemplateButton>
          )}
        </S.NameContainer>
        <S.Description>{_.truncate(template.description, {length: 140})}</S.Description>

        <S.AdditionalInformation>
          <span>Author: {template.author}</span>
          <span>Version: {template.version}</span>
        </S.AdditionalInformation>

        <S.Footer>
          <S.OpenButton
            disabled={disabled}
            icon={<DeliveredProcedureOutlined />}
            $noPadding={actionType === 'link'}
            type={actionType === 'button' ? 'primary' : 'link'}
            size={actionType === 'button' ? 'middle' : 'small'}
            onClick={onClickOpenTemplate}
          >
            {actionLabel || 'Use Template'}
          </S.OpenButton>
        </S.Footer>
      </S.InfoContainer>
    </S.Container>
  );
};

export default TemplateInformation;
