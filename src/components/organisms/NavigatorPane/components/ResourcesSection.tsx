import React, {useState, useEffect, useCallback} from 'react';
import micromatch from 'micromatch';

import {useSelector} from 'react-redux';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {MonoSectionTitle} from '@components/atoms';
import {K8sResource, ResourceValidationError} from '@models/k8sresource';
import {NavigatorSection, NavigatorSubSection} from '@models/navigator';
import {activeResourcesSelector} from '@redux/selectors';
import {selectK8sResource} from '@redux/reducers/main';
import {getNamespaces} from '@redux/services/resource';

import {ResourceFilterType} from '@components/molecules/ResourceFilter';

import NavigatorContentTitle from './NavigatorContentTitle';
import NamespacesSection from './NamespacesSection';
import SectionRow from './SectionRow';
import SectionCol from './SectionCol';
import Section from './Section';

import {ALL_NAMESPACES} from '../constants';

const filterByNamespace = (resource: K8sResource, namespace: string): boolean => {
  return (
    namespace === ALL_NAMESPACES || resource.namespace === namespace || (namespace === 'default' && !resource.namespace)
  );
};

function isPassingKeyValueFilter(target: any, keyValueFilter: Record<string, string | null>) {
  return Object.entries(keyValueFilter).every(([key, value]) => {
    if (!target[key]) {
      return false;
    }
    if (value !== null) {
      return target[key] === value;
    }
    return true;
  });
}

function isResourcePassingFilters(resource: K8sResource, filters: ResourceFilterType) {
  if (filters.name && resource.name.toLowerCase().indexOf(filters.name.toLowerCase()) === -1) {
    return false;
  }
  if (filters.kind && resource.kind !== filters.kind) {
    return false;
  }
  if (filters.namespace && resource.namespace !== filters.namespace) {
    return false;
  }
  if (filters.labels && Object.keys(filters.labels).length > 0) {
    const resourceLabels = resource.content?.metadata?.labels;
    if (!resourceLabels) {
      return false;
    }
    const isPassingLabelFilter = isPassingKeyValueFilter(resourceLabels, filters.labels);
    if (!isPassingLabelFilter) {
      return false;
    }
  }
  if (filters.annotations && Object.keys(filters.annotations).length > 0) {
    const resourceAnnotations = resource.content?.metadata?.annotations;
    if (!resourceAnnotations) {
      return false;
    }
    const isPassingAnnotationsFilter = isPassingKeyValueFilter(resourceAnnotations, filters.annotations);
    if (!isPassingAnnotationsFilter) {
      return false;
    }
  }
  return true;
}

const ResourcesSection = (props: {
  filters: ResourceFilterType;
  showErrorsModal: (errors: ResourceValidationError[]) => void;
}) => {
  const {filters, showErrorsModal} = props;
  const dispatch = useAppDispatch();
  const appConfig = useAppSelector(state => state.config);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const previewResource = useAppSelector(state => state.main.previewResourceId);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const activeResources = useSelector(activeResourcesSelector);

  const [namespace, setNamespace] = useState<string>(ALL_NAMESPACES);
  const [namespaces, setNamespaces] = useState<string[]>([ALL_NAMESPACES]);

  useEffect(() => {
    let ns = getNamespaces(resourceMap);
    setNamespaces(ns.concat([ALL_NAMESPACES]));
    if (namespace && ns.indexOf(namespace) === -1) {
      setNamespace(ALL_NAMESPACES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceMap, previewResource]);

  const handleNamespaceChange = (value: any) => {
    setNamespace(value);
  };

  const selectResource = (resourceId: string) => {
    dispatch(selectK8sResource({resourceId}));
  };

  const [expandedSubsectionsBySection, setExpandedSubsectionsBySection] = useState<Record<string, string[]>>(
    // set all subsections of each section as expanded by default
    Object.fromEntries(
      appConfig.navigators
        .map(navigator => navigator.sections)
        .flat()
        .map(section => [section.name, section.subsections.map(subsection => subsection.name)])
    )
  );

  const handleSubsectionExpand = (sectionName: string, subsectionName: string) => {
    const currentExpandedSubsections = [...(expandedSubsectionsBySection[sectionName] || [])];
    const updatedSubsectionsBySection = {
      ...expandedSubsectionsBySection,
      [sectionName]: [...new Set([...currentExpandedSubsections, subsectionName])],
    };
    setExpandedSubsectionsBySection(updatedSubsectionsBySection);
  };

  const handleSubsectionCollapse = (sectionName: string, subsectionName: string) => {
    setExpandedSubsectionsBySection({
      ...expandedSubsectionsBySection,
      [sectionName]: expandedSubsectionsBySection[sectionName].filter(s => s !== subsectionName),
    });
  };

  const shouldResourceBeVisible = useCallback(
    (item: K8sResource, subsection: NavigatorSubSection) => {
      return (
        item.kind === subsection.kindSelector &&
        micromatch.isMatch(item.version, subsection.apiVersionSelector) &&
        filterByNamespace(item, namespace) &&
        Object.values(resourceMap).length > 0 &&
        isResourcePassingFilters(item, filters)
      );
    },
    [filters, namespace, resourceMap]
  );

  function shouldSectionBeVisible(section: NavigatorSection) {
    return (
      activeResources.length === 0 ||
      (activeResources.length > 0 && section.subsections.some(subsection => shouldSubsectionBeVisible(subsection)))
    );
  }

  function shouldSubsectionBeVisible(subsection: NavigatorSubSection) {
    return (
      activeResources.length === 0 ||
      (activeResources.length > 0 &&
        activeResources.some(
          resource => resource.kind === subsection.kindSelector && filterByNamespace(resource, namespace)
        ))
    );
  }

  // ensure that subsections containing selected or highlighted sections are expanded
  useEffect(() => {
    const subsectionsToExpandBySection: Record<string, string[]> = {};
    appConfig.navigators
      .map(navigator => navigator.sections)
      .flat()
      .forEach(section => {
        section.subsections
          .filter(subsection => shouldSubsectionBeExpanded(subsection))
          .forEach(subsection => {
            if (!subsectionsToExpandBySection[section.name]) {
              subsectionsToExpandBySection[section.name] = [subsection.name];
            } else {
              subsectionsToExpandBySection[section.name] = [
                ...subsectionsToExpandBySection[section.name],
                subsection.name,
              ];
            }
          });
      });
    const updatedExpandedSubsectionsBySection: Record<string, string[]> = Object.fromEntries(
      Object.entries(expandedSubsectionsBySection).map(([sectionName, expandedSubsections]) => {
        const subsectionsToExpand = [...(subsectionsToExpandBySection[sectionName] || [])];
        return [sectionName, [...new Set([...expandedSubsections, ...subsectionsToExpand])]];
      })
    );
    setExpandedSubsectionsBySection(updatedExpandedSubsectionsBySection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceMap, selectedResourceId, appConfig.navigators]);

  function shouldSubsectionBeExpanded(subsection: NavigatorSubSection) {
    return (
      activeResources.length === 0 ||
      (activeResources.length > 0 &&
        activeResources.some(
          resource =>
            resource.kind === subsection.kindSelector && (resource.isHighlighted || selectedResourceId === resource.id)
        ))
    );
  }

  return (
    <SectionRow>
      <SectionCol>
        {appConfig.navigators.map(navigator => {
          return (
            <div key={navigator.name}>
              <SectionRow>
                <MonoSectionTitle>{navigator.name}</MonoSectionTitle>
              </SectionRow>
              <SectionRow>
                {navigator.name === 'K8s Resources' && (
                  <NamespacesSection namespace={namespace} namespaces={namespaces} onSelect={handleNamespaceChange} />
                )}
              </SectionRow>
              <SectionRow>
                <SectionCol>
                  {navigator.sections
                    .filter(section => shouldSectionBeVisible(section))
                    .map(section => {
                      return (
                        <div key={section.name}>
                          {section.name.length > 0 && (
                            <SectionRow>
                              <NavigatorContentTitle>{section.name}</NavigatorContentTitle>
                            </SectionRow>
                          )}
                          <Section
                            expandedSubsections={expandedSubsectionsBySection[section.name]}
                            onSubsectionExpand={handleSubsectionExpand}
                            onSubsectionCollapse={handleSubsectionCollapse}
                            section={section}
                            shouldResourceBeVisible={shouldResourceBeVisible}
                            shouldSubsectionBeVisible={shouldSubsectionBeVisible}
                            resources={activeResources}
                            selectResource={selectResource}
                            showErrorsModal={showErrorsModal}
                          />
                        </div>
                      );
                    })}
                </SectionCol>
              </SectionRow>
            </div>
          );
        })}
      </SectionCol>
    </SectionRow>
  );
};

export default ResourcesSection;
