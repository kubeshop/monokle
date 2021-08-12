import React from 'react';

import {K8sResource} from '@models/k8sresource';
import NavigatorKustomizationRow from '@molecules/NavigatorKustomizationRow';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {hasIncomingRefs, hasOutgoingRefs} from '@redux/services/resourceRefs';
import {startPreview, stopPreview} from '@redux/services/preview';
import {selectK8sResource} from '@redux/reducers/main';

type KustomizationsSectionProps = {
  kustomizations: K8sResource[];
};

const KustomizationsSection = (props: KustomizationsSectionProps) => {
  const {kustomizations} = props;
  const dispatch = useAppDispatch();

  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const previewResource = useAppSelector(state => state.main.previewResource);
  const selectedResource = useAppSelector(state => state.main.selectedResource);

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
    <>
      {kustomizations.map((k: K8sResource) => {
        const isSelected = k.isSelected || previewResource === k.id;
        const isDisabled = Boolean(previewResource && previewResource !== k.id);
        const isHighlighted = k.isHighlighted;
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
            onClickResource={!previewResource || previewResource === k.id ? () => selectResource(k.id) : undefined}
            onClickPreview={() => selectPreview(k.id)}
            isPreviewLoading={previewLoader.isLoading && k.id === previewLoader.targetResourceId}
          />
        );
      })}
    </>
  );
};

export default KustomizationsSection;
