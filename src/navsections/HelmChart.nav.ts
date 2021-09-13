import {HelmValuesFile} from '@models/helm';
import {HelmChartMapType, HelmValuesMapType} from '@models/appstate';
import {selectHelmValuesFile} from '@redux/reducers/main';
import {AppDispatch} from '@redux/store';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {NavSection} from '@models/navsection';

export type HelmChartNavSectionScope = {
  helmChartMap: HelmChartMapType;
  helmValuesMap: HelmValuesMapType;
  dispatch: AppDispatch;
};

export const HelmChartNavSection: NavSection<HelmValuesFile, HelmChartNavSectionScope> = {
  name: 'Helm Charts',
  useScope: () => {
    const dispatch = useAppDispatch();
    const helmChartMap = useAppSelector(state => state.main.helmChartMap);
    const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
    return {
      helmChartMap,
      helmValuesMap,
      dispatch,
    };
  },
  getItemsGrouped: scope => {
    if (!scope || !scope.helmChartMap || !scope.helmValuesMap) {
      return {};
    }
    return Object.fromEntries(
      Object.values(scope.helmChartMap).map(helmChart => {
        const helmValuesFiles = helmChart.valueFileIds.map(valuesFile => scope.helmValuesMap[valuesFile]);
        return [helmChart.name, helmValuesFiles];
      })
    );
  },
  itemHandlers: {
    getName: item => item.name,
    getIdentifier: item => item.id,
    isSelected: item => {
      return item.isSelected;
    },
    onClick: (item, scope) => {
      scope.dispatch(selectHelmValuesFile({valuesFileId: item.id}));
    },
  },
};
