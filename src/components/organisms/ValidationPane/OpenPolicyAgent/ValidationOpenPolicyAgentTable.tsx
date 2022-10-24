import React, {useMemo, useState} from 'react';
import {useMeasure} from 'react-use';

import {Input, Skeleton} from 'antd';

import {useAppSelector} from '@redux/hooks';

import * as S from './ValidationOpenPolicyAgentTable.styled';
import {useOpenPolicyAgentTable} from './useOpenPolicyAgentTable';

export type Severity = 'high' | 'medium' | 'low';
export type Rule = {
  id: string;
  name: string;
  description: string;
  learnMoreUrl?: string;
  severity: Severity;
  enabled: boolean;
};

interface IProps {
  descriptionHeight: number;
  height: number;
}

export const ValidationOpenPolicyAgentTable: React.FC<IProps> = ({descriptionHeight, height}) => {
  const [containerRef, {width}] = useMeasure<HTMLDivElement>();

  const columns = useOpenPolicyAgentTable(width);
  const rules = useAppSelector(state => {
    const plugins = state.main.policies.plugins;

    // Current UI only supports one single plugin.
    const defaultPlugin = plugins[0];

    // Default plugin is not loaded yet.
    if (!defaultPlugin) return [];

    return defaultPlugin.metadata.rules.map(rule => {
      const severity: Severity = ['high', 'medium', 'low'].includes(rule.properties.severity)
        ? (rule.properties.severity as Severity)
        : 'low';

      return {
        id: rule.id,
        name: rule.shortDescription.text,
        description: `${rule.longDescription.text} ${rule.help.text}`,
        learnMoreUrl: rule.helpUri,
        severity,
        enabled: defaultPlugin.config.enabledRules.includes(rule.id),
      };
    });
  });
  const [filter, setFilter] = useState<string>('');

  const filteredRules: Rule[] = useMemo(() => {
    return rules.filter(rule => (filter.length === 0 ? true : rule.description.toLowerCase().includes(filter)));
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
