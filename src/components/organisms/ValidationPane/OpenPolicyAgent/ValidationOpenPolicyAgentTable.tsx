import React, {useMemo, useState} from 'react';
import {useMeasure} from 'react-use';

import {Input, Skeleton} from 'antd';

import {useAppSelector} from '@redux/hooks';
import {VALIDATOR} from '@redux/validation/validation.services';

import {DEFAULT_TRIVY_PLUGIN} from '@monokle/validation';

import * as S from './ValidationOpenPolicyAgentTable.styled';
import {useOpenPolicyAgentTable} from './useOpenPolicyAgentTable';

export type Severity = 'high' | 'medium' | 'low';
export type Rule = {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  learnMoreUrl?: string;
  severity: 'low' | 'medium' | 'high';
  enabled: boolean;
};

interface IProps {
  descriptionHeight: number;
  height: number;
}

export const ValidationOpenPolicyAgentTable: React.FC<IProps> = ({descriptionHeight, height}) => {
  const configRules = useAppSelector(state => state.validation.config.rules);

  const [containerRef, {width}] = useMeasure<HTMLDivElement>();

  const columns = useOpenPolicyAgentTable(width);

  const rules = useMemo(() => {
    const metadata = DEFAULT_TRIVY_PLUGIN;

    return metadata.rules.map(rule => {
      const ruleName = `open-policy-agent/${rule.name}`;
      const enabled = VALIDATOR.isRuleEnabled(ruleName);
      const severity =
        rule.properties === undefined
          ? 'low'
          : ['high', 'medium', 'low'].includes(rule.properties.severity ?? '')
          ? rule.properties.severity
          : 'low';

      return {
        id: rule.id,
        name: rule.name,
        shortDescription: rule.shortDescription.text,
        fullDescription: `${rule.fullDescription.text} ${rule.help.text}`,
        learnMoreUrl: rule.helpUri,
        enabled,
        severity,
      };
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configRules]);

  const [filter, setFilter] = useState<string>('');

  const filteredRules: Rule[] = useMemo(() => {
    return rules.filter(rule => (filter.length === 0 ? true : rule.fullDescription.toLowerCase().includes(filter)));
  }, [rules, filter]);

  if (rules.length === 0) {
    return <Skeleton />;
  }

  return (
    <S.Container ref={containerRef}>
      <S.InputContainer>
        <Input
          prefix={<S.SearchIcon />}
          value={filter}
          onChange={event => setFilter(event.target.value.toLowerCase())}
        />
      </S.InputContainer>

      <S.TableContainer $height={height - descriptionHeight - 93}>
        <S.Table
          columns={columns}
          dataSource={filteredRules}
          pagination={false}
          rowKey="id"
          locale={{emptyText: 'No rules found'}}
        />
      </S.TableContainer>
    </S.Container>
  );
};
