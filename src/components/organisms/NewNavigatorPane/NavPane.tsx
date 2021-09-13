import React, {useContext} from 'react';
import AppContext from '@src/AppContext';
import {K8sResource} from '@models/k8sresource';
import {HelmValuesFile} from '@models/helm';
import {KustomizationNavSection, KustomizationNavSectionScope} from '@src/navsections/Kustomization.nav';
import {HelmChartNavSection, HelmChartNavSectionScope} from '@src/navsections/HelmChart.nav';
import {K8sResourceNavSection, K8sResourceNavSectionScope} from '@src/navsections/K8sResource.nav';
import NavSectionRenderer from './NavSectionRenderer';
import * as S from './NavPane.styled';

const NavSectionsPane = () => {
  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - 100;
  return (
    <nav>
      <S.List height={navigatorHeight}>
        <NavSectionRenderer<HelmValuesFile, HelmChartNavSectionScope> navSection={HelmChartNavSection} level={0} />
        <NavSectionRenderer<K8sResource, KustomizationNavSectionScope> navSection={KustomizationNavSection} level={0} />
        <NavSectionRenderer<K8sResource, K8sResourceNavSectionScope> navSection={K8sResourceNavSection} level={0} />
      </S.List>
    </nav>
  );
};

export default NavSectionsPane;
