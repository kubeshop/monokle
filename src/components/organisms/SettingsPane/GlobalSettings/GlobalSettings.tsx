import {useCallback, useEffect, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Checkbox, Form, Input, Select, Tooltip} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';
import {useForm} from 'antd/lib/form/Form';

import _ from 'lodash';

import {DEFAULT_KUBECONFIG_DEBOUNCE, TOOLTIP_DELAY} from '@constants/constants';
import {AutoLoadLastProjectTooltip, TelemetryDocumentationUrl} from '@constants/tooltips';

import {
  changeProjectsRootPath,
  toggleErrorReporting,
  updateFileExplorerSortOrder,
  updateLoadLastProjectOnStartup,
} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleEventTracking} from '@redux/thunks/project';

import {FileExplorer} from '@components/atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import electronStore from '@shared/utils/electronStore';
import {openUrlInExternalBrowser} from '@shared/utils/shell';

import * as S from './GlobalSettings.styled';

export const GlobalSettings = () => {
  const dispatch = useAppDispatch();
  const disableEventTracking = useAppSelector(state => state.config.disableEventTracking);
  const disableErrorReporting = useAppSelector(state => state.config.disableErrorReporting);
  const fileExplorerSortOrder = useAppSelector(state => state.config.fileExplorerSortOrder);
  const loadLastProjectOnStartup = useAppSelector(state => state.config.loadLastProjectOnStartup);
  const projectsRootPath = useAppSelector(state => state.config.projectsRootPath);

  const [shouldAppendServerPath, _setShouldAppendServerPath] = useState<boolean>(
    electronStore.get('kubeConfig.proxyOptions.appendServerPath') ?? true
  );

  const setShouldAppendServerPath = useCallback(
    (value: boolean) => {
      _setShouldAppendServerPath(value);
      electronStore.set('kubeConfig.proxyOptions.appendServerPath', value);
    },
    [_setShouldAppendServerPath]
  );

  const [disableClusterValidation, _setDisableClusterValidation] = useState<boolean>(
    electronStore.get('appConfig.settings.disableClusterValidation') ?? false
  );

  const setDisableClusterValidation = useCallback(
    (value: boolean) => {
      _setDisableClusterValidation(value);
      electronStore.set('appConfig.settings.disableClusterValidation', value);
    },
    [_setDisableClusterValidation]
  );

  const [isOverridingBinaryPaths, _setIsOverridingBinaryPaths] = useState<boolean>(
    Boolean(electronStore.get('appConfig.binaryPaths')) ?? false
  );

  const setIsOverridingBinaryPaths = useCallback(
    (value: boolean) => {
      _setIsOverridingBinaryPaths(value);
      electronStore.set('appConfig.binaryPaths', value === false ? null : {});
    },
    [_setIsOverridingBinaryPaths]
  );

  const [kubectlBinaryPath, _setKubectlBinaryPath] = useState<string>(
    electronStore.get('appConfig.binaryPaths.kubectl') ?? ''
  );

  const setKubectlBinaryPath = useCallback(
    (value: string) => {
      _setKubectlBinaryPath(value);
      electronStore.set('appConfig.binaryPaths.kubectl', value);
    },
    [_setKubectlBinaryPath]
  );

  const [helmBinaryPath, _setHelmBinaryPath] = useState<string>(electronStore.get('appConfig.binaryPaths.helm') ?? '');

  const setHelmBinaryPath = useCallback(
    (value: string) => {
      _setHelmBinaryPath(value);
      electronStore.set('appConfig.binaryPaths.helm', value);
    },
    [_setHelmBinaryPath]
  );

  const [currentProjectsRootPath, setCurrentProjectsRootPath] = useState(projectsRootPath);

  const [settingsForm] = useForm();

  const handleToggleEventTracking = (e: CheckboxChangeEvent) => {
    dispatch(toggleEventTracking(e.target.checked));
  };

  const handleToggleErrorReporting = () => {
    dispatch(toggleErrorReporting());
  };

  const handleChangeLoadLastFolderOnStartup = (e: any) => {
    dispatch(updateLoadLastProjectOnStartup(e.target.checked));
  };

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        settingsForm.setFieldsValue({projectsRootPath: folderPath});
        setCurrentProjectsRootPath(folderPath);
      }
    },
    {isDirectoryExplorer: true}
  );

  useEffect(() => {
    settingsForm.setFieldsValue({projectsRootPath});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsRootPath]);

  useDebounce(
    () => {
      if (currentProjectsRootPath && currentProjectsRootPath !== projectsRootPath) {
        dispatch(changeProjectsRootPath(currentProjectsRootPath));
      }
    },
    DEFAULT_KUBECONFIG_DEBOUNCE,
    [currentProjectsRootPath]
  );

  return (
    <div style={{display: 'flex', justifyContent: 'space-between'}}>
      <div style={{width: '45%'}}>
        <Form
          form={settingsForm}
          initialValues={() => ({projectsRootPath})}
          autoComplete="off"
          onFieldsChange={(field: any, allFields: any) => {
            const rootPath = allFields.filter((f: any) => _.includes(f.name.toString(), 'projectsRootPath'))[0].value;
            setCurrentProjectsRootPath(rootPath);
          }}
        >
          <>
            <S.Heading>Projects Root Path</S.Heading>
            <Form.Item required tooltip="The local path where your projects will live.">
              <Input.Group compact>
                <Form.Item
                  name="projectsRootPath"
                  noStyle
                  rules={[
                    {
                      required: true,
                      message: 'Please provide your projects root path!',
                    },
                  ]}
                >
                  <Input style={{width: 'calc(100% - 100px)'}} />
                </Form.Item>
                <Button style={{width: '100px'}} onClick={openFileExplorer}>
                  Browse
                </Button>
              </Input.Group>
            </Form.Item>
          </>
        </Form>

        <S.Div>
          <S.Heading>File explorer sorting order</S.Heading>
          <Select
            style={{width: '100%'}}
            value={fileExplorerSortOrder}
            onChange={value => dispatch(updateFileExplorerSortOrder(value))}
          >
            <Select.Option value="folders" key="folders">
              Folders first
            </Select.Option>
            <Select.Option value="files" key="files">
              Files first
            </Select.Option>
            <Select.Option value="mixed" key="mixed">
              Mixed
            </Select.Option>
          </Select>
        </S.Div>

        <S.Div>
          <S.Span>On Startup</S.Span>
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={AutoLoadLastProjectTooltip}>
            <Checkbox checked={loadLastProjectOnStartup} onChange={handleChangeLoadLastFolderOnStartup}>
              Automatically load last project
            </Checkbox>
          </Tooltip>
        </S.Div>

        <S.Div>
          <S.Span>Cluster</S.Span>
          <Checkbox checked={shouldAppendServerPath} onChange={e => setShouldAppendServerPath(e.target.checked)}>
            Append Server Path to Kubectl Proxy
          </Checkbox>
          <Checkbox checked={disableClusterValidation} onChange={e => setDisableClusterValidation(e.target.checked)}>
            Disable validation of cluster resources
          </Checkbox>
        </S.Div>

        <S.Div>
          <S.Span>Binary Configuration</S.Span>
          <Checkbox checked={isOverridingBinaryPaths} onChange={e => setIsOverridingBinaryPaths(e.target.checked)}>
            Override binary paths
          </Checkbox>
          {isOverridingBinaryPaths && (
            <>
              <Form.Item label="kubectl path">
                <Input value={kubectlBinaryPath} onChange={e => setKubectlBinaryPath(e.target.value)} />
              </Form.Item>
              <Form.Item label="helm path">
                <Input value={helmBinaryPath} onChange={e => setHelmBinaryPath(e.target.value)} />
              </Form.Item>
            </>
          )}
        </S.Div>
      </div>

      <div style={{width: '45%'}}>
        <S.Div>
          <S.TelemetryTitle>Telemetry</S.TelemetryTitle>
          <S.TelemetryInfo>
            <S.TelemetryDescription>Data gathering is anonymous.</S.TelemetryDescription>
            <S.TelemetryReadMoreLink onClick={() => openUrlInExternalBrowser(TelemetryDocumentationUrl)}>
              Read more about it in our documentation.
            </S.TelemetryReadMoreLink>
          </S.TelemetryInfo>
          <S.Div style={{marginBottom: '8px'}}>
            <Checkbox checked={disableEventTracking} onChange={handleToggleEventTracking}>
              Disable gathering of <S.BoldSpan>usage metrics</S.BoldSpan>
            </Checkbox>
          </S.Div>
          <S.Div>
            <Checkbox checked={disableErrorReporting} onChange={handleToggleErrorReporting}>
              Disable gathering of <S.BoldSpan>error reports</S.BoldSpan>
            </Checkbox>
          </S.Div>
        </S.Div>
      </div>

      <FileExplorer {...fileExplorerProps} />
    </div>
  );
};
