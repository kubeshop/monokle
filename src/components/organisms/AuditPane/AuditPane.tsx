import React from 'react';

import groupBy from 'lodash/groupBy.js';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@monokle/components';
import {ValidationResponse, createDefaultMonokleValidator, getRuleForResult} from '@monokle/validation';
import type {Resource} from '@monokle/validation/lib/common/types.js';

import * as S from './AuditPane.styled';

const AuditPane: React.FC = () => {
  const [validationResponse, setValidationResponse] = React.useState<ValidationResponse>();
  const [groupedResults, setGroupedResults] = React.useState<any>();
  const resources = useAppSelector(state => Object.values(state.main.resourceMap)) as Resource[];
  const validator = createDefaultMonokleValidator();

  const makeValidation = async () => {
    const response = await validator.validate({resources});
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

  const renderGroupList = () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [location, results] of Object.entries(groupedResults)) {
      <>
        {' '}
        <div>{location}</div>
        {renderRules(results)}
      </>;
    }
  };

  const renderRules = (results: any) => {
    if (!validationResponse) return null;
    results.map((result: any) => {
      const rule = getRuleForResult(validationResponse, result);
      const message = result.message.text;
      return (
        <>
          <div>{rule.name}</div>
          <div>{rule.helpUri}</div>
        </>
      );
    });
  };

  return (
    <S.AuditPaneContainer id="AuditPane">
      <TitleBar title="Validation errors" />
      <S.List id="audit-sections-container">{renderGroupList()}</S.List>
    </S.AuditPaneContainer>
  );
};

export default AuditPane;
