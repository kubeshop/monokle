import React, {useMemo, useState} from 'react';
import {useMeasure} from 'react-use';

import {Input, Skeleton} from 'antd';

import {
  pluginMetadataSelector,
  pluginRulesSelector,
  useValidationSelector,
} from '@redux/validation/validation.selectors';

import type {Rule} from '@shared/models/validation';

import * as S from './ValidationOpenPolicyAgentTable.styled';
import {useOpenPolicyAgentTable} from './useOpenPolicyAgentTable';

export const ValidationOpenPolicyAgentTable: React.FC = () => {
  const plugin = useValidationSelector(s => pluginMetadataSelector(s, 'open-policy-agent')!);
  const pluginRules = useValidationSelector(state => pluginRulesSelector(state, 'open-policy-agent'));

  const [containerRef, {width}] = useMeasure<HTMLDivElement>();

  const columns = useOpenPolicyAgentTable(plugin, width);

  const rules: Rule[] = useMemo(() => {
    return pluginRules.map(rule => {
      const enabled = rule.configuration.enabled ?? false;
      const severity = rule.properties?.['security-severity'];
      const severityLabel = !severity ? 'low' : severity < 4 ? 'low' : severity < 7 ? 'medium' : 'high';
      const level = rule.configuration.level === 'error' ? 'error' : 'warning';
      const defaultLevel = rule.defaultConfiguration?.level === 'error' ? 'error' : 'warning';

      return {
        id: rule.id,
        name: rule.name,
        shortDescription: rule.shortDescription.text,
        fullDescription: `${rule.fullDescription ? rule.fullDescription.text : rule.shortDescription.text} ${
          rule.help.text
        }`,
        learnMoreUrl: rule.helpUri,
        enabled,
        severity: severityLabel,
        defaultLevel,
        level,
      };
    });
  }, [pluginRules]);

  const [filter, setFilter] = useState<string>('');

  const filteredRules: Rule[] = useMemo(() => {
    return rules.filter(rule => (filter.length === 0 ? true : rule.fullDescription.toLowerCase().includes(filter)));
  }, [rules, filter]);

  if (rules.length === 0) {
    return <Skeleton active />;
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

      <S.TableContainer>
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
