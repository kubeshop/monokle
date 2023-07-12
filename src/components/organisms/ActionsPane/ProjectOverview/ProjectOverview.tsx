import {MouseEvent} from 'react';

import {SettingOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  openNewAiResourceWizard,
  openNewResourceWizard,
  openTemplateExplorer,
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

import {openDocumentation} from '@shared/utils';

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
    dispatch(setLeftMenuSelection('settings'));
  };

  const onClickErrorsCountHandler = () => {
    dispatch(setValidationFilters({...currentFilters.current, type: 'error'}));
    dispatch(setLeftMenuSelection('validation'));
  };

  const onClickWarningsCountHandler = () => {
    dispatch(setValidationFilters({...currentFilters.current, type: 'warning'}));
    dispatch(setLeftMenuSelection('validation'));
  };

  const onClickCompareHandler = () => {
    dispatch(setLeftMenuSelection('compare'));
  };

  const onClickNewAIResourceHandler = () => {
    dispatch(openNewAiResourceWizard());
  };

  const onClickNewResourcesTemplateHandler = () => {
    dispatch(openTemplateExplorer());
  };

  const onClickNewResourceHandler = () => {
    dispatch(openNewResourceWizard());
  };

  return (
    <S.Container>
      <S.Title>Overview</S.Title>
      <S.CardContainer>
        <S.Card>
          <S.CardTitle>Files & Resources</S.CardTitle>
          <S.CardContent>
            <S.CountChip $type="resource">
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%'}}>
                <div>
                  <S.Count>{filesCount}</S.Count>
                  <S.SmallText style={{marginLeft: 4}}>Files</S.SmallText>
                </div>
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
                <S.Text onClick={() => dispatch(setExplorerSelectedSection('files'))}>Check out files</S.Text> and
                resources in the left to see relations, edit and fix errors.
              </S.GreyText>
            )}
          </S.CardContent>
        </S.Card>

        <S.Card>
          <S.CardTitle>Misconfigurations</S.CardTitle>
          <S.CardContent>
            <S.CountChip $type="error" onClick={onClickErrorsCountHandler}>
              <div style={{display: 'flex'}}>
                <S.Count>{errorsCount}</S.Count>
                <S.SmallText style={{alignSelf: 'flex-end', marginLeft: 4}}>errors</S.SmallText>
              </div>
              <SettingOutlined onClick={onClickValidationSettingsHandler} />
            </S.CountChip>

            <S.CountChip $type="warning" onClick={onClickWarningsCountHandler}>
              <div style={{display: 'flex'}}>
                <S.Count>{warningsCount}</S.Count>
                <S.SmallText style={{alignSelf: 'end', marginLeft: 4}}>warnings</S.SmallText>
              </div>
              <SettingOutlined onClick={onClickValidationSettingsHandler} />
            </S.CountChip>
          </S.CardContent>
        </S.Card>
      </S.CardContainer>

      <S.CardContainer>
        <S.Card>
          <S.CardTitle>Helm</S.CardTitle>
          <S.CardContent>
            <S.CountChip $type="resource">
              <div>
                <S.Count>{helmChartsCount}</S.Count>
                <S.SmallText>Helm Charts</S.SmallText>
              </div>
            </S.CountChip>

            {helmChartsCount === 0 ? (
              <S.Text onClick={() => dispatch(setLeftMenuSelection('helm'))}>
                Browse Helm Charts to download / install Add Helm repository
              </S.Text>
            ) : (
              <S.GreyText>
                <S.Text onClick={() => dispatch(setExplorerSelectedSection('helm'))}>Check out Helm Charts </S.Text>
                found on your files. You can dry-run them and
                <S.Text onClick={() => dispatch(setLeftMenuSelection('helm'))}> add new Helm Charts.</S.Text>
              </S.GreyText>
            )}
          </S.CardContent>
        </S.Card>

        <S.Card>
          <S.CardTitle>Kustomize</S.CardTitle>
          <S.CardContent>
            <S.CountChip $type="resource">
              <div>
                <S.Count>{kustomizationsResourcesCount}</S.Count>
                <S.SmallText>Kustomize overlays</S.SmallText>
              </div>
            </S.CountChip>

            <S.GreyText>
              <S.Text onClick={() => dispatch(setExplorerSelectedSection('kustomize'))}>
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
          <S.CardContent>
            <S.Text onClick={onClickCompareHandler}>Compare to cluster</S.Text>

            <S.Text onClick={onClickNewAIResourceHandler}> New resource from AI</S.Text>

            <S.Text onClick={onClickNewResourcesTemplateHandler}> New resource from advanced template</S.Text>

            <S.Text onClick={onClickNewResourceHandler}> New resource manually</S.Text>

            <S.Text onClick={() => openDocumentation()}>Documentation</S.Text>
          </S.CardContent>
        </S.Card>
      </S.CardContainer>
    </S.Container>
  );
};

export default ProjectOverview;
