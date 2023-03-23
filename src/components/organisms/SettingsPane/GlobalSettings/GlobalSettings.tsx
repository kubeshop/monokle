import {useEffect, useState} from 'react';
import {useDebounce} from 'react-use';

import {Button, Checkbox, Form, Input, Select, Tooltip} from 'antd';
import {useForm} from 'antd/lib/form/Form';

import _ from 'lodash';

import {DEFAULT_KUBECONFIG_DEBOUNCE, TOOLTIP_DELAY} from '@constants/constants';
import {AutoLoadLastProjectTooltip, TelemetryDocumentationUrl} from '@constants/tooltips';

import {
  changeProjectsRootPath,
  toggleErrorReporting,
  toggleEventTracking,
  updateFileExplorerSortOrder,
  updateLoadLastProjectOnStartup,
  updateUsingKubectlProxy,
} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {FileExplorer} from '@components/atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {openUrlInExternalBrowser} from '@shared/utils/shell';

import * as S from './GlobalSettings.styled';

export const GlobalSettings = () => {
  const dispatch = useAppDispatch();
  const disableEventTracking = useAppSelector(state => state.config.disableEventTracking);
  const disableErrorReporting = useAppSelector(state => state.config.disableErrorReporting);
  const fileExplorerSortOrder = useAppSelector(state => state.config.fileExplorerSortOrder);
  const loadLastProjectOnStartup = useAppSelector(state => state.config.loadLastProjectOnStartup);
  const projectsRootPath = useAppSelector(state => state.config.projectsRootPath);
  const useKubectlProxy = useAppSelector(state => state.config.useKubectlProxy);

  const [currentProjectsRootPath, setCurrentProjectsRootPath] = useState(projectsRootPath);

  const [settingsForm] = useForm();

  const handleToggleEventTracking = () => {
    dispatch(toggleEventTracking());
  };

  const handleToggleErrorReporting = () => {
    dispatch(toggleErrorReporting());
  };

  const handleChangeLoadLastFolderOnStartup = (e: any) => {
    dispatch(updateLoadLastProjectOnStartup(e.target.checked));
  };

  const handleChangeUsingKubectlProxy = (e: any) => {
    dispatch(updateUsingKubectlProxy(e.target.checked));
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
          <S.Span>Kubectl proxy</S.Span>
          <Checkbox checked={useKubectlProxy} onChange={handleChangeUsingKubectlProxy}>
            Use kubectl proxy
          </Checkbox>
        </S.Div>

        <S.Span>On Startup</S.Span>
        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={AutoLoadLastProjectTooltip}>
          <Checkbox checked={loadLastProjectOnStartup} onChange={handleChangeLoadLastFolderOnStartup}>
            Automatically load last project
          </Checkbox>
        </Tooltip>
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
