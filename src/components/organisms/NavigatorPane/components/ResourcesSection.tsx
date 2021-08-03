import React, {useState, useEffect} from 'react';
import micromatch from 'micromatch';

import {useSelector} from 'react-redux';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {MonoSectionTitle} from '@components/atoms';
import {K8sResource} from '@models/k8sresource';
import {NavigatorSubSection} from '@models/navigator';
import {selectActiveResources} from '@redux/selectors';
import {selectK8sResource} from '@redux/reducers/main';
import {getNamespaces} from '@redux/utils/resource';

import NavigatorContentTitle from './NavigatorContentTitle';

import NamespacesSection from './NamespacesSection';
import SectionRow from './SectionRow';
import SectionCol from './SectionCol';
import Section from './Section';

import {ALL_NAMESPACES} from '../constants';

const ResourcesSection = () => {
  const dispatch = useAppDispatch();
  const appConfig = useAppSelector(state => state.config);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const previewResource = useAppSelector(state => state.main.previewResource);
  const resources = useSelector(selectActiveResources);

  const [namespace, setNamespace] = useState<string>(ALL_NAMESPACES);
  const [namespaces, setNamespaces] = useState<string[]>([ALL_NAMESPACES]);

  useEffect(() => {
    let ns = getNamespaces(resourceMap);
    setNamespaces(ns.concat([ALL_NAMESPACES]));
    if (namespace && ns.indexOf(namespace) === -1) {
      setNamespace(ALL_NAMESPACES);
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [resourceMap, previewResource]); // es-lint-disable

  const handleNamespaceChange = (value: any) => {
    setNamespace(value);
  };

  const selectResource = (resourceId: string) => {
    dispatch(selectK8sResource(resourceId));
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
    setExpandedSubsectionsBySection({
      ...expandedSubsectionsBySection,
      [sectionName]: [...(expandedSubsectionsBySection[sectionName] || []), subsectionName],
    });
  };

  const handleSubsectionCollapse = (sectionName: string, subsectionName: string) => {
    setExpandedSubsectionsBySection({
      ...expandedSubsectionsBySection,
      [sectionName]: expandedSubsectionsBySection[sectionName].filter(s => s !== subsectionName),
    });
  };

  function shouldResourceBeVisible(item: K8sResource, subsection: NavigatorSubSection) {
    return (
      item.kind === subsection.kindSelector &&
      micromatch.isMatch(item.version, subsection.apiVersionSelector) &&
      (namespace === ALL_NAMESPACES || item.namespace === namespace || (namespace === 'default' && !item.namespace)) &&
      Object.values(resourceMap).length > 0
    );
  }

  function shouldSubsectionBeVisible(subsection: NavigatorSubSection) {
    return (
      resources.length === 0 ||
      (resources.length > 0 && resources.some(resource => resource.kind === subsection.kindSelector))
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

                {navigator.name === 'K8s Resources' && (
                  <NamespacesSection namespace={namespace} namespaces={namespaces} onSelect={handleNamespaceChange} />
                )}
              </SectionRow>
              <SectionRow>
                <SectionCol>
                  {navigator.sections.map(section => {
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
                          resources={resources}
                          selectResource={selectResource}
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
