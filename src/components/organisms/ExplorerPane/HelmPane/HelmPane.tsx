import {memo} from 'react';
import {useMeasure} from 'react-use';

import {CollapsePanelProps, Input, Typography} from 'antd';

import {size} from 'lodash';
import styled from 'styled-components';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {searchHelmRepo, setHelmRepoPane, setHideNavigatorPane} from '@redux/reducers/ui';

import {SectionRenderer} from '@molecules';

import {SectionBlueprintList} from '@atoms';

import RootHelmChartsSectionBlueprint from '@src/navsections/HelmChartSectionBlueprint';

import {Icon, TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';
import {Colors} from '@shared/styles';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';

const HelmPane: React.FC<InjectedPanelProps> = props => {
  const dispatch = useAppDispatch();
  const {isActive, panelKey} = props;

  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const [containerRef, {width: containerWidth}] = useMeasure<HTMLDivElement>();

  const onHelmRepoSearchChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(searchHelmRepo(e.target.value));
  };

  const onHelmRepoSearchFocusHandler = () => {
    dispatch(setHelmRepoPane(true));
    dispatch(setHideNavigatorPane(true));
  };
  const onHelmRepoSearchBlurHandler = () => {
    // dispatch(setHelmRepoPane(false));
    //  dispatch(setHideNavigatorPane(false));
  };

  return (
    <AccordionPanel
      {...props}
      disabled={isInClusterMode}
      header={
        <AccordionTitleBarContainer ref={containerRef}>
          <TitleBar
            title="Helm"
            expandable
            isOpen={Boolean(isActive)}
            actions={<TitleBarCount count={size(helmChartMap)} isActive={Boolean(isActive)} />}
          />
        </AccordionTitleBarContainer>
      }
      showArrow={false}
      key={panelKey as CollapsePanelProps['key']}
    >
      <div>
        <HelmExplorer>
          <HelmExplorerTitle>Browse Helm Charts</HelmExplorerTitle>
          <HelmExplorerInput
            prefix={<Icon name="globe-search" />}
            placeholder="Search Charts to download"
            onChange={onHelmRepoSearchChangeHandler}
            onFocus={onHelmRepoSearchFocusHandler}
            onBlur={onHelmRepoSearchBlurHandler}
          />
        </HelmExplorer>
        <SectionBlueprintList id="helm-sections-container" $width={containerWidth + 15}>
          <SectionRenderer sectionId={RootHelmChartsSectionBlueprint.id} level={0} isLastSection={false} />
        </SectionBlueprintList>
      </div>
    </AccordionPanel>
  );
};

export default memo(HelmPane);

const HelmExplorer = styled.div`
  position: sticky;
  top: 0;
  height: 136px;
  background-color: rgba(82, 115, 224, 0.3);
  margin: 0px 16px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  padding-left: 16px;
  padding-right: 14px;
  z-index: 10;
  &:before {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
  }
`;

const HelmExplorerTitle = styled(Typography.Text)`
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
  color: ${Colors.grey9};
`;

const HelmExplorerInput = styled(Input)`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  width: unset !important;
  border: none !important;
  font-size: 14px !important;
  line-height: 22px !important;

  ::placeholder {
    color: ${Colors.grey8};
  }

  svg {
    color: ${Colors.grey8};
    margin-right: 8px;
  }
`;
