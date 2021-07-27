import React from 'react';
import {Select, Skeleton} from 'antd';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import {selectHelmCharts, selectKustomizations} from '@redux/selectors';
import {useAppSelector} from '@redux/hooks';
import {PaneContainer} from '@atoms';

import HelmChartsSection from './HelmChartsSection';
import SectionRow from './SectionRow';
import KustomizationsSection from './KustomizationsSection';
import ResourcesSection from './ResourcesSection';

const {Option} = Select;

const StyledSkeleton = styled(Skeleton)`
  margin: 20px;
  width: 90%;
`;

const NavigatorContent = (props: {
  namespace: string;
  namespaces: string[];
  setNamespace: (namespace: string) => void;
}) => {
  const {namespace, namespaces, setNamespace} = props;

  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const helmCharts = useSelector(selectHelmCharts);
  const kustomizations = useSelector(selectKustomizations);

  const handleNamespaceChange = (value: any) => {
    setNamespace(value);
  };

  return (
    <PaneContainer>
      {Object.values(helmCharts).length > 0 && <HelmChartsSection helmCharts={helmCharts} />}

      {kustomizations.length > 0 && <KustomizationsSection kustomizations={kustomizations} />}

      <SectionRow style={{paddingLeft: 16}}>
        Namespace:
        <Select
          showSearch
          placeholder="Namespace"
          onChange={handleNamespaceChange}
          size="small"
          style={{minWidth: '50%'}}
          bordered={false}
          value={namespace}
        >
          {namespaces.map(n => {
            return (
              <Option key={n} value={n}>
                {n}
              </Option>
            );
          })}
        </Select>
      </SectionRow>

      {previewLoader.isLoading ? <StyledSkeleton /> : <ResourcesSection namespace={namespace} />}
    </PaneContainer>
  );
};

export default NavigatorContent;
