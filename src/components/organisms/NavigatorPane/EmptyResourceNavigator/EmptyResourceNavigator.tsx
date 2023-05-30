import {useCallback, useMemo} from 'react';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResourceFilter} from '@redux/reducers/main';
import {openNewAiResourceWizard, openNewResourceWizard, openTemplateExplorer} from '@redux/reducers/ui';
import {activeResourceCountSelector} from '@redux/selectors/resourceMapSelectors';

import FromAI from '@assets/newResource/FromAI.svg';
import FromAIHovered from '@assets/newResource/FromAIHovered.svg';
import FromAdvancedTemplate from '@assets/newResource/FromAdvancedTemplate.svg';
import FromAdvancedTemplateHovered from '@assets/newResource/FromAdvancedTemplateHovered.svg';
import FromModel from '@assets/newResource/FromModel.svg';
import FromModelHovered from '@assets/newResource/FromModelHovered.svg';

import {ResourceFilterType} from '@shared/models/appState';
import {NewResourceAction} from '@shared/models/resourceCreate';
import {trackEvent} from '@shared/utils/telemetry';

import NewResourceCard from './NewResourceCard';

const EmptyResourceNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const hasAnyActiveResources = useAppSelector(state => activeResourceCountSelector(state) > 0);

  const resetFilters = useCallback(() => {
    const emptyFilter: ResourceFilterType = {annotations: {}, labels: {}};
    dispatch(updateResourceFilter(emptyFilter));
  }, [dispatch]);

  const newResourceActionsList: NewResourceAction[] = useMemo(
    () => [
      {
        image: FromAI,
        hoverImage: FromAIHovered,
        fromTypeLabel: 'AI',
        onClick: () => {
          trackEvent('new_resource/create', {type: 'AI', from: 'empty_navigator'});
          dispatch(openNewAiResourceWizard());
        },
      },
      {
        image: FromAdvancedTemplate,
        hoverImage: FromAdvancedTemplateHovered,
        fromTypeLabel: 'advanced template',
        onClick: () => {
          trackEvent('new_resource/create', {type: 'advanced_template', from: 'empty_navigator'});
          dispatch(openTemplateExplorer());
        },
      },
      {
        image: FromModel,
        hoverImage: FromModelHovered,
        fromTypeLabel: 'model',
        onClick: () => {
          trackEvent('new_resource/create', {type: 'wizard', from: 'empty_navigator'});
          dispatch(openNewResourceWizard());
        },
      },
    ],
    [dispatch]
  );

  return (
    <Container>
      {hasAnyActiveResources ? (
        <p>
          No resources match the active filters. <a onClick={resetFilters}>[Reset Filters]</a>
        </p>
      ) : (
        <NewResourceCardsContainer>
          {newResourceActionsList.map(action => (
            <NewResourceCard action={action} />
          ))}
        </NewResourceCardsContainer>
      )}
    </Container>
  );
};

export default EmptyResourceNavigator;

// Styled Components

const Container = styled.div`
  padding: 20px;
`;

const NewResourceCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
