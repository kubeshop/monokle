import {useState} from 'react';

import {Button} from 'antd';

import {ObjectFieldTemplateProps, RJSFSchema} from '@rjsf/utils';

import {uniqueId} from 'lodash';

import * as S from './FormEditor.styled';

const FormObjectFieldTemplate = (props: ObjectFieldTemplateProps<any, RJSFSchema, any>) => {
  const {title, properties, uiSchema, schema, onAddClick} = props;
  const [isExpanded, toggleExpand] = useState<boolean>(true);
  const opacity = (10 - (uiSchema?.level ?? 0)) / 10;

  return (
    <>
      <S.TitleWrapper onClick={() => toggleExpand(prev => !prev)} opacityStep={opacity || 1}>
        {isExpanded ? <S.ArrowIconExpanded /> : <S.ArrowIconClosed />}

        {title ? (
          <S.TitleText isBold={uiSchema?.level === 0}>{title}</S.TitleText>
        ) : (
          <S.ElementText>element</S.ElementText>
        )}
      </S.TitleWrapper>
      {isExpanded && (
        <>
          {properties.map((element: any) => (
            <S.PropertyContainer key={element.content.key || uniqueId()}>{element.content}</S.PropertyContainer>
          ))}
          <Button style={{marginTop: properties.length === 0 ? '1rem' : '0'}} onClick={onAddClick(schema)}>
            Add Item
          </Button>
        </>
      )}
    </>
  );
};

export default FormObjectFieldTemplate;
