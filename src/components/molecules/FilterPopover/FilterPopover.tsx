import {useCallback, useMemo, useState} from 'react';
import {useDebounce} from 'react-use';

import {Badge, Button, Col, Input, Popover, Row, Space, Tabs} from 'antd';

import {FilterOutlined} from '@ant-design/icons';

import Colors from '@styles/Colors';

import {KeyValueInput, NewKeyValueInput} from './keyValueInput';

export type Filter = {
  namespace?: string;
  kind?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
};

type Props = {
  filter: Filter | undefined;
  onChange: (newFilter: Filter | undefined) => void;
  disabled?: boolean;
};

export function FilterPopover({filter, onChange, disabled}: Props) {
  const filterCount = filter ? Object.keys(filter).length : 0;
  const labelCount = filter?.labels ? Object.keys(filter.labels).length : 0;
  const annotationCount = filter?.annotations ? Object.keys(filter.annotations).length : 0;

  const [namespace, setNamespace] = useState<string | undefined>(filter?.namespace);
  const [kind, setKind] = useState<string | undefined>(filter?.kind);

  const filterButton = useMemo(
    () => (
      <Badge count={filterCount} offset={[-6, 6]} size="small" color={Colors.blue7} style={{borderColor: Colors.blue7}}>
        <Button
          disabled={disabled}
          icon={<FilterOutlined />}
          type="link"
          color={filterCount > 0 ? Colors.greenOkay : undefined}
          style={{marginLeft: 8}}
        />
      </Badge>
    ),
    [disabled, filterCount]
  );

  const handleChange = useCallback(
    (newFilter: Filter) => {
      const isEmpty = Object.keys(newFilter).length === 0;
      onChange(isEmpty ? undefined : newFilter);
    },
    [onChange]
  );

  useDebounce(
    () => {
      if (namespace === filter?.namespace) return;
      const newFilter = {...filter, namespace};
      if (!namespace) delete newFilter.namespace;
      handleChange(newFilter);
    },
    250,
    [namespace]
  );

  useDebounce(
    () => {
      if (kind === filter?.kind) return;
      const newFilter = {...filter, kind};
      if (!kind) delete newFilter.kind;
      handleChange(newFilter);
    },
    250,
    [kind]
  );

  const handleAddLabelFilter = useCallback(
    ([key, value]: any) => {
      const newLabels = {...filter?.labels, [key]: value};
      const newFilter: Filter = {...filter, labels: newLabels};
      handleChange(newFilter);
    },
    [filter, handleChange]
  );

  const handleRemoveLabelFilter = useCallback(
    (key: string) => {
      const newLabels = {...filter?.labels};
      delete newLabels[key];
      const newFilter: Filter = {...filter, labels: newLabels};
      const isEmpty = Object.keys(newLabels).length === 0;
      if (isEmpty) delete newFilter.labels;
      handleChange(newFilter);
    },
    [filter, handleChange]
  );

  const handleUpdateLabelFilter = useCallback(
    ([key, value]: any) => {
      const newLabels = {...filter?.labels, [key]: value};
      const newFilter: Filter = {...filter, labels: newLabels};
      handleChange(newFilter);
    },
    [filter, handleChange]
  );

  const handleAddAnnotationFilter = useCallback(
    ([key, value]: any) => {
      const newAnnotations = {...filter?.annotations, [key]: value};
      const newFilter: Filter = {...filter, annotations: newAnnotations};
      handleChange(newFilter);
    },
    [filter, handleChange]
  );

  const handleRemoveAnnotationFilter = useCallback(
    (key: string) => {
      const newAnnotations = {...filter?.annotations};
      delete newAnnotations[key];
      const newFilter: Filter = {...filter, annotations: newAnnotations};
      const isEmpty = Object.keys(newAnnotations).length === 0;
      if (isEmpty) delete newFilter.annotations;
      handleChange(newFilter);
    },
    [filter, handleChange]
  );

  const handleUpdateAnnotationFilter = useCallback(
    ([key, value]: any) => {
      const newAnnotations = {...filter?.annotations, [key]: value};
      const newFilter: Filter = {...filter, annotations: newAnnotations};
      handleChange(newFilter);
    },
    [filter, handleChange]
  );

  const handleClearAllFilters = useCallback(() => {
    setNamespace(undefined);
    setKind(undefined);
    handleChange({});
  }, [handleChange]);

  if (disabled) {
    return <>{filterButton}</>;
  }

  return (
    <Popover
      content={
        <div style={{width: 380}}>
          <Tabs
            items={[
              {
                label: 'General',
                key: '2',
                children: (
                  <Space direction="vertical" style={{width: '100%'}}>
                    <Row style={{alignItems: 'center'}}>
                      <Col span={8}>
                        <span>Namespace</span>
                      </Col>
                      <Col span={16}>
                        <Input value={namespace} onChange={e => setNamespace(e.target.value)} />
                      </Col>
                    </Row>

                    <Row style={{alignItems: 'center'}}>
                      <Col span={8}>
                        <span>Resource Kind</span>
                      </Col>
                      <Col span={16}>
                        <Input value={kind} onChange={e => setKind(e.target.value)} />
                      </Col>
                    </Row>
                  </Space>
                ),
              },
              {
                key: '1',
                label: (
                  <Badge dot={labelCount > 0} color={Colors.blue7} offset={[4, 3]}>
                    Labels
                  </Badge>
                ),
                children: (
                  <Space direction="vertical" style={{width: '100%'}}>
                    <NewKeyValueInput onAddKeyValue={handleAddLabelFilter} />

                    {filter?.labels &&
                      Object.entries(filter.labels).map(kvPair => {
                        return (
                          <KeyValueInput
                            key={kvPair[0]}
                            pair={kvPair}
                            onDelete={handleRemoveLabelFilter}
                            onChange={handleUpdateLabelFilter}
                          />
                        );
                      })}
                  </Space>
                ),
              },
              {
                key: '3',
                label: (
                  <Badge dot={annotationCount > 0} color={Colors.blue7} offset={[4, 3]}>
                    Annotations
                  </Badge>
                ),
                children: (
                  <Space direction="vertical" style={{width: '100%'}}>
                    <NewKeyValueInput onAddKeyValue={handleAddAnnotationFilter} />

                    {filter?.annotations &&
                      Object.entries(filter.annotations).map(kvPair => {
                        return (
                          <KeyValueInput
                            key={kvPair[0]}
                            pair={kvPair}
                            onDelete={handleRemoveAnnotationFilter}
                            onChange={handleUpdateAnnotationFilter}
                          />
                        );
                      })}
                  </Space>
                ),
              },
            ]}
          />

          <div style={{marginTop: 14, display: 'flex', justifyContent: 'space-between'}}>
            <div />
            <Space>
              <Button type="link" onClick={handleClearAllFilters}>
                Clear all filters
              </Button>
            </Space>
          </div>
        </div>
      }
      placement="bottomRight"
    >
      {filterButton}
    </Popover>
  );
}
