import React, {useMemo, useState} from 'react';

import {Skeleton} from 'antd';

import {useAppSelector} from '@redux/hooks';

import * as S from './ValidationOpenPolicyAgentTable.styled';
import {COLUMNS} from './ValidationOpenPolicyAgentTableConfig';

export type Severity = 'high' | 'medium' | 'low';
export type Rule = {
  id: string;
  description: string;
  severity: Severity;
  enabled: boolean;
};

export function ValidationOpenPolicyAgentTable() {
  const rules = useAppSelector(state => {
    const plugins = state.main.policies.plugins;

    // Current UI only supports one single plugin.
    const defaultPlugin = plugins[0];

    // Default plugin is not loaded yet.
    if (!defaultPlugin) return [];

    return defaultPlugin.metadata.rules.map(rule => ({
      id: rule.id,
      description: rule.longDescription.text,
      severity: rule.properties.severity,
      enabled: defaultPlugin.config.enabledRules.includes(rule.id),
    }));
  });
  const [filter] = useState<string>(''); // TODO add filter.

  const filteredRules = useMemo(() => {
    return rules.filter(rule => (filter.length === 0 ? true : rule.description.includes(filter)));
  }, [rules, filter]);

  if (rules.length === 0) {
    return <Skeleton />;
  }

  return (
    <>
      <S.Table
        columns={COLUMNS}
        dataSource={filteredRules}
        pagination={false}
        components={{
          body: {},
        }}
      />
    </>
  );
}
