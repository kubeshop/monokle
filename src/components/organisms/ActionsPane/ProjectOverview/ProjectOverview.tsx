import {MouseEvent} from 'react';

import {SettingOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  openNewAiResourceWizard,
  openNewResourceWizard,
  openTemplateExplorer,
  setActiveSettingsPanel,
  setExplorerSelectedSection,
  setLeftMenuSelection,
} from '@redux/reducers/ui';
import {helmChartsCountSelector, kustomizationResourcesCountSelector} from '@redux/selectors';
import {navigatorResourcesCountSelector} from '@redux/selectors/resourceSelectors';
import {
  errorsByResourcesFilterCountSelector,
  warningsByResourcesFilterCountSelector,
} from '@redux/validation/validation.selectors';
import {setValidationFilters} from '@redux/validation/validation.slice';

import {useRefSelector} from '@utils/hooks';

import {SettingsPanel} from '@shared/models/config';
import {ExplorerCollapsibleSectionsType} from '@shared/models/ui';
import {openDocumentation, trackEvent} from '@shared/utils';

import * as S from './styled';

const ProjectOverview = () => {
  const dispatch = useAppDispatch();
  const currentFilters = useRefSelector(state => state.validation.validationOverview.filters);

  const filesCount = useAppSelector(state => Object.values(state.main.fileMap).filter(f => !f.children).length);
  const resourcesCount = useAppSelector(navigatorResourcesCountSelector);

  const kustomizationsResourcesCount = useAppSelector(kustomizationResourcesCountSelector);
  const helmChartsCount = useAppSelector(helmChartsCountSelector);
  const errorsCount = useAppSelector(errorsByResourcesFilterCountSelector);
  const warningsCount = useAppSelector(warningsByResourcesFilterCountSelector);

  const onClickValidationSettingsHandler = (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    dispatch(setActiveSettingsPanel(SettingsPanel.ValidationSettings));
    dispatch(setLeftMenuSelection('settings'));
    trackEvent('project_summary/select_validation_settings');
  };

  const onClickValidationHandler = (type?: 'warning' | 'error') => {
    dispatch(setValidationFilters({...currentFilters.current, type}));

    dispatch(setLeftMenuSelection('validation'));
    trackEvent('project_summary/select_validation', {type});
  };

  const onClickHelmRepoHandler = () => {
    dispatch(setLeftMenuSelection('helm'));
    trackEvent('project_summary/select_helm_repo');
  };

  const onClickCompareHandler = () => {
    dispatch(setLeftMenuSelection('compare'));
    trackEvent('project_summary/select_compare');
  };

  const onClickNewAIResourceHandler = () => {
    dispatch(openNewAiResourceWizard());
    trackEvent('project_summary/new_ai_resource');
  };

  const onClickNewResourcesTemplateHandler = () => {
    dispatch(openTemplateExplorer());
    trackEvent('project_summary/new_template_resource');
  };

  const onClickNewResourceHandler = () => {
    dispatch(openNewResourceWizard());
    trackEvent('project_summary/new_empty_resource');
  };

  const onChangeExplorerSelectionHandler = (key: ExplorerCollapsibleSectionsType) => {
    dispatch(setExplorerSelectedSection(key));
    trackEvent('project_summary/select_explorer_section', {section: key});
  };

  return (
    <S.Container>
      <S.Title>
        <S.Text>
          ← Select a resource to the left to <S.Text className="weight-700">edit and fix</S.Text>
        </S.Text>
        <S.GreyText>
          In the meantime, check out your <S.GreyText className="weight-700">project summary ↓</S.GreyText>
        </S.GreyText>
      </S.Title>
      <S.CardContainer>
        <S.Card>
          <S.CardTitle>Misconfigurations</S.CardTitle>
          <S.CardContent>
            <S.CountChip $type="error" onClick={() => onClickValidationHandler('error')}>
              <div style={{display: 'flex'}} className="clickable-text">
                <S.Count>{errorsCount}</S.Count>
                <S.SmallText style={{alignSelf: 'flex-end', marginLeft: 4}}>errors</S.SmallText>
              </div>
              <SettingOutlined onClick={onClickValidationSettingsHandler} />
            </S.CountChip>

            <S.CountChip $type="warning" onClick={() => onClickValidationHandler('warning')}>
              <div style={{display: 'flex'}} className="clickable-text">
                <S.Count>{warningsCount}</S.Count>
                <S.SmallText style={{alignSelf: 'end', marginLeft: 4}}>warnings</S.SmallText>
              </div>
              <SettingOutlined onClick={onClickValidationSettingsHandler} />
            </S.CountChip>

            <S.GreyText>
              Analyze and fix errors in the <S.Text onClick={() => onClickValidationHandler()}>Validation Pane</S.Text>,
              configure your policy in the{' '}
              <S.Text onClick={onClickValidationSettingsHandler}>Policy Configuration</S.Text>
            </S.GreyText>
          </S.CardContent>
        </S.Card>

        <S.Card>
          <S.CardTitle>Files & Resources</S.CardTitle>
          <S.CardContent>
            <S.CountChip $type="resource">
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%'}}>
                <S.CountContainer className="clickable-text" onClick={() => onChangeExplorerSelectionHandler('files')}>
                  <S.Count>{filesCount}</S.Count>
                  <S.SmallText style={{marginLeft: 4}}>Files</S.SmallText>
                </S.CountContainer>
                <S.ResourcesContainer $hasResources={Boolean(resourcesCount)}>
                  <S.Count>{resourcesCount}</S.Count>
                  <S.SmallText style={{marginLeft: 4}}>Resources</S.SmallText>
                </S.ResourcesContainer>
              </div>
            </S.CountChip>

            {resourcesCount === 0 ? (
              <S.GreyText>
                Create your first resource: <S.Text onClick={onClickNewResourceHandler}>manually,</S.Text>{' '}
                <S.Text onClick={onClickNewResourcesTemplateHandler}>from advanced template</S.Text> or{' '}
                <S.Text onClick={onClickNewAIResourceHandler}>from AI</S.Text>
              </S.GreyText>
            ) : (
              <S.GreyText>
                <S.Text onClick={() => onChangeExplorerSelectionHandler('files')}>Check out files</S.Text> and resources
                in the left to see relations, edit and fix errors.
              </S.GreyText>
            )}
          </S.CardContent>
        </S.Card>
      </S.CardContainer>

      <S.CardContainer>
        <S.Card>
          <S.CardTitle>Helm</S.CardTitle>
          <S.CardContent>
            <S.CountChip $type="resource">
              <S.CountContainer className="clickable-text" onClick={() => onChangeExplorerSelectionHandler('helm')}>
                <S.Count>{helmChartsCount}</S.Count>
                <S.SmallText>Helm Charts</S.SmallText>
              </S.CountContainer>
            </S.CountChip>

            {helmChartsCount === 0 ? (
              <S.Text onClick={() => onClickHelmRepoHandler()}>
                Browse Helm Charts to download / install Add Helm repository
              </S.Text>
            ) : (
              <S.GreyText>
                <S.Text onClick={() => onChangeExplorerSelectionHandler('helm')}>Check out Helm Charts </S.Text>
                found on your files. You can dry-run them and
                <S.Text onClick={() => onClickHelmRepoHandler()}> add new Helm Charts.</S.Text>
              </S.GreyText>
            )}
          </S.CardContent>
        </S.Card>

        <S.Card>
          <S.CardTitle>Kustomize</S.CardTitle>
          <S.CardContent>
            <S.CountChip $type="resource">
              {kustomizationsResourcesCount === 0 ? (
                <div>
                  <S.SmallText>No Kustomize Overlays found</S.SmallText>
                </div>
              ) : (
                <S.CountContainer
                  className="clickable-text"
                  onClick={() => onChangeExplorerSelectionHandler('kustomize')}
                >
                  <S.Count>{kustomizationsResourcesCount}</S.Count>
                  <S.SmallText>Kustomize overlays</S.SmallText>
                </S.CountContainer>
              )}
            </S.CountChip>

            <S.GreyText>
              <S.Text onClick={() => onChangeExplorerSelectionHandler('kustomize')}>
                Check out Kustimize overlays{' '}
              </S.Text>
              found on your files. You can dry-run them.
            </S.GreyText>
          </S.CardContent>
        </S.Card>
      </S.CardContainer>

      <S.CardContainer>
        <S.Card>
          <S.CardTitle>More actions</S.CardTitle>
          <S.CardContent style={{gap: 8}}>
            <S.Link onClick={onClickCompareHandler}>Compare to cluster</S.Link>

            <S.Link onClick={onClickNewAIResourceHandler}> New resource from AI</S.Link>

            <S.Link onClick={onClickNewResourcesTemplateHandler}> New resource from advanced template</S.Link>

            <S.Link onClick={onClickNewResourceHandler}> New resource manually</S.Link>

            <S.Link onClick={() => openDocumentation()}>Documentation</S.Link>
          </S.CardContent>
        </S.Card>
      </S.CardContainer>
    </S.Container>
  );
};

export default ProjectOverview;
