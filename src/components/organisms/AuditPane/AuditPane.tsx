import React from 'react';

import {Tree} from 'antd';

import groupBy from 'lodash/groupBy.js';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {Icon} from '@atoms';

import {TitleBar} from '@monokle/components';
import {ValidationResponse, createDefaultMonokleValidator, getRuleForResult} from '@monokle/validation';
import type {Resource} from '@monokle/validation/lib/common/types.js';
import {Colors} from '@shared/styles/colors';

import * as S from './AuditPane.styled';

const StyledTreeWrapper = styled.div`
  & .ant-tree-treenode-selected {
    background: ${Colors.grey1} !important;
    color: ${Colors.grey1} !important;
  }
  & .ant-tree-treenode-selected::before {
    background: ${Colors.blue9} !important;
    color: ${Colors.grey1} !important;
  }
  .ant-tree.ant-tree-directory .ant-tree-treenode .ant-tree-node-content-wrapper.ant-tree-node-selected {
    color: ${Colors.blackPure} !important;
    font-weight: bold;
  }

  .parent {
    display: flex;
    color: ${Colors.grey8};
  }

  & .ant-tree-node-selected > .ant-tree-title > .parent {
    color: ${Colors.blackPure} !important;
  }

  .anticon {
    color: ${Colors.grey8};
  }

  .redicon {
    color: ${Colors.red7};
  }

  & .ant-tree-node-selected .anticon,
  .ant-tree-node-selected .redicon {
    color: ${Colors.blackPure} !important;
  }

  & .location {
    font-weight: bold;
    color: ${Colors.grey8};
    display: flex;
    margin-right: 10px;
    font-size: 12px;
  }

  & .ant-tree-node-selected .location {
    font-weight: normal;
    color: ${Colors.grey1} !important;
  }
`;

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
            <Icon style={{margin: '4px 6px 0 -20px', fontSize: 10}} name="opa-status" />
            <Icon style={{margin: '4px 10px 0 0', fontSize: 10}} name="severity-high" className="redicon" />
            <div className="location">{result.locations[0].physicalLocation.region.startLine}</div>
            {rule.name}
          </div>
        ),
        isLeaf: true,
        key: JSON.stringify(result),
      });
    });

    const currentData = {
      title: (
        <div className="parent">
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
      <StyledTreeWrapper>
        {treeData && (
          <Tree.DirectoryTree showIcon={false} style={{width: '100%'}} defaultExpandAll treeData={treeData} />
        )}
      </StyledTreeWrapper>
    </S.AuditPaneContainer>
  );
};

export default AuditPane;
