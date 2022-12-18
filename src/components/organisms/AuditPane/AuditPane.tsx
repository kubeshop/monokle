import React from 'react';

import {Tree} from 'antd';

import groupBy from 'lodash/groupBy.js';

import {useAppSelector} from '@redux/hooks';

import {Icon} from '@atoms';

import {TitleBar} from '@monokle/components';
import {ValidationResponse, createDefaultMonokleValidator, getRuleForResult} from '@monokle/validation';
import type {Resource} from '@monokle/validation/lib/common/types.js';
import {Colors} from '@shared/styles/colors';

import * as S from './AuditPane.styled';

const AuditPane: React.FC = () => {
  const [validationResponse, setValidationResponse] = React.useState<ValidationResponse>();
  const resources = useAppSelector(state => Object.values(state.main.resourceMap)) as Resource[];
  const validator = createDefaultMonokleValidator();
  const [treeData, setTreeData] = React.useState<any[]>([]);

  const makeValidation = async () => {
    const response = await validator.validate({resources});
    setValidationResponse(response);
  };

  React.useEffect(() => {
    makeValidation();
  }, []);

  React.useEffect(() => {
    if (!validationResponse) return;
    const data: any[] = [];
    const allResults = validationResponse.runs.flatMap(r => r.results);
    const groupedResult = groupBy(allResults, r => {
      const location = r.locations[1]?.logicalLocations?.[0]?.fullyQualifiedName;
      return location ?? 'unknown';
    });
    Object.entries(groupedResult).forEach(([location, results]) => {
      addRow(results, location, data);
    });
    setTreeData(data);
  }, [validationResponse]);

  const addRow = (results: any, location: string, data: any[]) => {
    if (!validationResponse) return null;
    const title = location.split('/').pop();
    const errorCount = results.length;
    const childNodes: any[] = [];
    results.forEach((result: any) => {
      const rule = getRuleForResult(validationResponse, result);
      console.log('result', result);
      console.log('rule', rule);
      childNodes.push({
        title: (
          <div style={{display: 'flex', width: '100%'}}>
            <Icon style={{fontSize: 10, margin: '4px 6px 0 -20px', color: Colors.grey8}} name="opa-status" />
            <Icon style={{fontSize: 10, margin: '4px 10px 0 0', color: Colors.red7}} name="severity-high" />
            <span style={{display: 'flex', color: Colors.grey8, marginRight: '10px', fontSize: '12px'}}>
              {result.locations[0].physicalLocation.region.startLine}
            </span>
            {rule.name}
          </div>
        ),
        isLeaf: true,
        key: JSON.stringify(result),
      });
    });

    const currentData = {
      title: (
        <div style={{display: 'flex', color: Colors.grey8}}>
          <span>{title}</span>
          <span style={{marginLeft: '10px', fontWeight: 'bold', fontSize: 13}}>{` ${errorCount}`}</span>
        </div>
      ),
      children: childNodes,
      isLeaf: false,
      key: location,
    };
    data.push(currentData);
  };

  return (
    <S.AuditPaneContainer id="AuditPane">
      <TitleBar title="Validation errors" />
      {treeData && <Tree treeData={treeData} />}
    </S.AuditPaneContainer>
  );
};

export default AuditPane;
