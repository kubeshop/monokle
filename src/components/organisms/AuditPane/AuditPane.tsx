import React from 'react';

import groupBy from 'lodash/groupBy.js';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@monokle/components';
import {createDefaultMonokleValidator, getRuleForResult} from '@monokle/validation';
import {ValidationResponse} from '@monokle/validation';
import type {Resource} from '@monokle/validation/lib/common/types.js';

import * as S from './AuditPane.styled';

const AuditPane: React.FC = () => {
  const [validationResponse, setValidationResponse] = React.useState<ValidationResponse>();
  const [groupedResults, setGroupedResults] = React.useState<any>();
  const resources = useAppSelector(state => Object.values(state.main.resourceMap)) as Resource[];
  const validator = createDefaultMonokleValidator();

  const makeValidation = async () => {
    const response = await validator.validate({resources: resources});
    setValidationResponse(response);
  };

  React.useEffect(() => {
    makeValidation();
  }, []);

  React.useEffect(() => {
    if (!validationResponse) return;
    const allResults = validationResponse.runs.flatMap(r => r.results);
    const groupedResult = groupBy(allResults, r => {
      const location = r.locations[1]?.logicalLocations?.[0]?.fullyQualifiedName;
      return location ?? 'unknown';
    });

    setGroupedResults(groupedResult);
  }, [validationResponse]);

  console.log(validationResponse);
  console.log(groupedResults);

  return (
    <S.AuditPaneContainer id="AuditPane">
      <TitleBar title="Validation errors" />
      {/* <S.List id="audit-sections-container">
        <SectionRenderer sectionBlueprint={} level={0} isLastSection={false} />
        <SectionRenderer sectionBlueprint={} level={0} isLastSection={false} />
      </S.List> */}
    </S.AuditPaneContainer>
  );
};

export default AuditPane;
