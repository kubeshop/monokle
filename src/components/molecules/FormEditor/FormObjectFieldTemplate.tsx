import {useState} from 'react';

import {ObjectFieldTemplateProps} from '@rjsf/core';

import * as S from './FormEditor.styled';

const FormObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
  const {title, properties, uiSchema} = props;
  const [isExpanded, toggleExpand] = useState<boolean>(true);
  const opacity = (10 - (uiSchema?.level ?? 0)) / 10;

  return (
    <S.FieldContainer>
      <S.TitleWrapper onClick={() => toggleExpand(prev => !prev)} opacityStep={opacity || 1}>
        {isExpanded ? <S.ArrowIconExpanded /> : <S.ArrowIconClosed />}

        {title ? (
          <S.TitleText isBold={uiSchema.level === 0}>{title}</S.TitleText>
        ) : (
          <S.ElementText>element</S.ElementText>
        )}
      </S.TitleWrapper>
      {isExpanded && (
        <>
          {properties.map((element: any) => (
            <S.PropertyContainer key={element.content.key}>{element.content}</S.PropertyContainer>
          ))}
        </>
      )}
    </S.FieldContainer>
  );
};

export default FormObjectFieldTemplate;
