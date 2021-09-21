import {NavSection} from '@models/navsection';
import navSectionNames from '@constants/navSectionNames';
import {K8sResource} from '@models/k8sresource';
import {ResourceKindHandlers} from '@src/kindhandlers';
import {ResourceKindHandler} from '@models/resourcekindhandler';
import {PreviewLoaderType} from '@models/appstate';
import {useAppSelector} from '@redux/hooks';
import navSectionMap from '@src/navsections/navSectionMap';
import {makeResourceKindNavSection} from './ResourceKindNavSection';

const subsectionNames = navSectionNames.representation[navSectionNames.K8S_RESOURCES];

const kindHandlersBySubsectionName: Record<string, ResourceKindHandler[]> = {};
ResourceKindHandlers.forEach(kindHandler => {
  const navSectionName = kindHandler.navigatorPath[0];
  if (navSectionName !== navSectionNames.K8S_RESOURCES) {
    return;
  }
  const subsectionName = kindHandler.navigatorPath[1];
  if (kindHandlersBySubsectionName[subsectionName]) {
    kindHandlersBySubsectionName[subsectionName].push(kindHandler);
  } else {
    kindHandlersBySubsectionName[subsectionName] = [kindHandler];
  }
});

export type K8sResourceNavSectionScope = {
  isFolderLoading: boolean;
  previewLoader: PreviewLoaderType;
};

const subsections = subsectionNames.map(subsectionName => {
  const kindHandlerSections = (kindHandlersBySubsectionName[subsectionName] || []).map(kindHandler =>
    makeResourceKindNavSection(kindHandler)
  );

  kindHandlerSections.forEach(k => navSectionMap.register(k));

  return {
    name: subsectionName,
    useScope: () => {},
    subsectionNames: kindHandlerSections.map(k => k.name),
  };
});

subsections.forEach(s => navSectionMap.register(s));

const K8sResourceNavSection: NavSection<K8sResource, K8sResourceNavSectionScope> = {
  name: navSectionNames.K8S_RESOURCES,
  useScope: () => {
    const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
    const previewLoader = useAppSelector(state => state.main.previewLoader);
    return {isFolderLoading, previewLoader};
  },
  isLoading: scope => {
    return scope.isFolderLoading || scope.previewLoader.isLoading;
  },
  subsectionNames,
};

export default K8sResourceNavSection;
