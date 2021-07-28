import React from 'react';

import {K8sResource} from '@models/k8sresource';
import NavigatorKustomizationRow from '@molecules/NavigatorKustomizationRow';
import {MonoSectionHeaderCol, MonoSectionTitle} from '@atoms';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {hasIncomingRefs, hasOutgoingRefs} from '@redux/utils/resourceRefs';
import {startPreview, stopPreview} from '@redux/utils/preview';
import {selectK8sResource} from '@redux/reducers/main';

import SectionRow from './SectionRow';
import SectionCol from './SectionCol';

type KustomizationsSectionProps = {
  kustomizations: K8sResource[];
};

const KustomizationsSection = (props: KustomizationsSectionProps) => {
  const {kustomizations} = props;
  const dispatch = useAppDispatch();

  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const previewResource = useAppSelector(state => state.main.previewResource);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const appConfig = useAppSelector(state => state.config);

  const selectResource = (resourceId: string) => {
    dispatch(selectK8sResource(resourceId));
  };

  const selectPreview = (id: string) => {
    if (id !== selectedResource) {
      dispatch(selectK8sResource(id));
    }
    if (id !== previewResource) {
      startPreview(id, 'kustomization', dispatch);
    } else {
      stopPreview(dispatch);
    }
  };

  return (
    <SectionRow>
      <SectionCol>
        <SectionRow>
          <MonoSectionHeaderCol>
            <MonoSectionTitle>Kustomizations</MonoSectionTitle>
          </MonoSectionHeaderCol>
        </SectionRow>
        {kustomizations
          .filter(k => k.highlight || k.selected || !selectedResource || previewResource === k.id)
          .map((k: K8sResource) => {
            const isSelected = k.selected || previewResource === k.id;
            const isDisabled = Boolean(previewResource && previewResource !== k.id);
            const isHighlighted = k.highlight;
            const buttonActive = previewResource !== undefined && previewResource === k.id;

            return (
              <NavigatorKustomizationRow
                key={k.id}
                rowKey={k.id}
                resource={k}
                isSelected={isSelected}
                isDisabled={isDisabled}
                highlighted={isHighlighted}
                previewButtonActive={buttonActive}
                hasIncomingRefs={Boolean(hasIncomingRefs(k))}
                hasOutgoingRefs={Boolean(hasOutgoingRefs(k))}
                onClickResource={!previewResource ? () => selectResource(k.id) : undefined}
                onClickPreview={() => selectPreview(k.id)}
                isPreviewLoading={previewLoader.isLoading && k.id === previewLoader.targetResourceId}
              />
            );
          })}
      </SectionCol>
    </SectionRow>
  );
};

export default KustomizationsSection;
