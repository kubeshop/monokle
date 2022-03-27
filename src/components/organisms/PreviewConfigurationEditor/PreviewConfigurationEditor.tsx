import {useCallback, useEffect, useMemo, useState} from 'react';

import {Button, Input, Select} from 'antd';

import _ from 'lodash';
import {v4 as uuidv4} from 'uuid';

import {HELM_INSTALL_OPTIONS_DOCS_URL, HELM_TEMPLATE_OPTIONS_DOCS_URL} from '@constants/constants';
import {helmInstallOptions, helmTemplateOptions} from '@constants/helmOptions';

import {HelmPreviewConfiguration, PreviewConfigValuesFileItem} from '@models/appconfig';
import {HelmValuesFile} from '@models/helm';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateProjectConfig} from '@redux/reducers/appConfig';
import {closePreviewConfigurationEditor} from '@redux/reducers/main';
import {startPreview} from '@redux/services/preview';

import {KeyValueInput} from '@components/atoms';

import ValuesFilesList from './ValuesFilesList';

import * as S from './styled';

const PreviewConfigurationEditor = () => {
  const dispatch = useAppDispatch();
  const helmPreviewMode = useAppSelector(
    state => state.config.projectConfig?.settings?.helmPreviewMode || state.config.settings.helmPreviewMode
  );
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const previewConfigurationMap = useAppSelector(
    state => state.config.projectConfig?.helm?.previewConfigurationMap || {}
  );
  const previewConfiguration = useAppSelector(state => {
    const previewConfigurationId = state.main.prevConfEditor.previewConfigurationId;
    if (!previewConfigurationId) {
      return undefined;
    }
    return previewConfigurationMap[previewConfigurationId];
  });
  const helmChart = useAppSelector(state => {
    const helmChartId = state.main.prevConfEditor.helmChartId;
    if (!helmChartId) {
      return undefined;
    }
    return state.main.helmChartMap[helmChartId];
  });

  const [name, setName] = useState<string>(() => previewConfiguration?.name || '');
  const [showNameError, setShowNameError] = useState(false);

  const [valuesFileItemMap, setValuesFileItemMap] = useState<Record<string, PreviewConfigValuesFileItem>>(() => {
    // get the existing items saved in the preview configuration
    let items = previewConfiguration
      ? Object.values(previewConfiguration.valuesFileItemMap).filter(
          (value): value is PreviewConfigValuesFileItem => value !== null
        )
      : [];

    const valuesFilesPaths =
      helmChart?.valueFileIds
        .map(id => helmValuesMap[id])
        .filter((v): v is HelmValuesFile => v !== undefined)
        .map(v => v.filePath) || [];

    // which values files have been removed from the helm chart folder ?
    const removedFilePaths: string[] = items
      .filter(item => !valuesFilesPaths.includes(item.filePath))
      .map(i => i.filePath);

    _.remove(items, item => removedFilePaths.includes(item.filePath));

    // fix the order numbers
    items = _.sortBy(items, ['order']).map((item, index) => {
      return {
        ...item,
        order: index,
      };
    });

    // used -1 here so the next order index starts from 0 if there are no items
    let nextOrderIndex = (_.last(items)?.order || -1) + 1;

    // which values files have been added to the helm chart folder?
    const addedFilePaths: string[] = valuesFilesPaths.filter(filePath => items.every(i => i.filePath !== filePath));
    items.push(
      ...addedFilePaths.map(filePath => {
        const item: PreviewConfigValuesFileItem = {
          id: filePath.slice(0, -5),
          filePath,
          isChecked: false,
          order: nextOrderIndex,
        };
        nextOrderIndex += 1;
        return item;
      })
    );

    return items.reduce((acc: Record<string, PreviewConfigValuesFileItem>, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
  });

  const [helmOptions, setHelmOptions] = useState<Record<string, string | null>>(previewConfiguration?.options || {});

  const [helmCommand, setHelmCommand] = useState<'template' | 'install'>(() => {
    if (previewConfiguration) {
      return previewConfiguration.command;
    }
    if (helmPreviewMode) {
      return helmPreviewMode;
    }
    return 'template';
  });

  const keyValueInputSchema = useMemo(
    () => (helmCommand === 'template' ? helmTemplateOptions : helmInstallOptions),
    [helmCommand]
  );

  const helmOptionsDocsUrl = useMemo(
    () => (helmCommand === 'template' ? HELM_TEMPLATE_OPTIONS_DOCS_URL : HELM_INSTALL_OPTIONS_DOCS_URL),
    [helmCommand]
  );

  const onClose = useCallback(() => {
    dispatch(closePreviewConfigurationEditor());
  }, [dispatch]);

  useEffect(() => {
    if (name.trim().length) {
      setShowNameError(false);
    }
  }, [name]);

  const onSave = useCallback(
    (shouldRunPreview?: boolean) => {
      if (!helmChart) {
        return;
      }
      if (!name.trim().length) {
        setShowNameError(true);
        return;
      }
      const input: HelmPreviewConfiguration = {
        id: previewConfiguration ? previewConfiguration.id : uuidv4(),
        name,
        helmChartFilePath: helmChart.filePath,
        command: helmCommand,
        options: helmOptions,
        valuesFileItemMap,
      };
      const updatedPreviewConfigurationMap = JSON.parse(JSON.stringify(previewConfigurationMap));
      updatedPreviewConfigurationMap[input.id] = input;

      dispatch(
        updateProjectConfig({
          config: {
            helm: {
              previewConfigurationMap: updatedPreviewConfigurationMap,
            },
          },
          fromConfigFile: false,
        })
      );

      dispatch(closePreviewConfigurationEditor());
      if (shouldRunPreview) {
        startPreview(input.id, 'helm-preview-config', dispatch);
      }
    },
    [
      dispatch,
      name,
      helmCommand,
      helmOptions,
      previewConfigurationMap,
      previewConfiguration,
      helmChart,
      valuesFileItemMap,
    ]
  );

  if (!helmChart) {
    return <p>Something went wrong, could not find the helm chart.</p>;
  }

  return (
    <div>
      <S.Field>
        <S.Label>Name your configuration:</S.Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter the configuration name" />
        {showNameError && <S.Error>You must enter a name for this Preview Configuration.</S.Error>}
      </S.Field>
      <S.Field>
        <S.Label style={{marginBottom: 0}}>Select which values files to use:</S.Label>
        <S.Description>Drag and drop to specify order</S.Description>
        <ValuesFilesList itemMap={valuesFileItemMap} onChange={itemMap => setValuesFileItemMap(itemMap)} />
      </S.Field>
      <S.Field>
        <S.Label>Select which helm command to use for this Preview:</S.Label>
        <Select value={helmCommand} onChange={setHelmCommand} style={{width: 150}}>
          <Select.Option value="template">Template</Select.Option>
          <Select.Option value="install">Install</Select.Option>
        </Select>
      </S.Field>
      <S.Field>
        <KeyValueInput
          label="Specify options:"
          value={helmOptions}
          schema={keyValueInputSchema}
          availableValuesByKey={{}}
          docsUrl={helmOptionsDocsUrl}
          onChange={setHelmOptions}
        />
      </S.Field>
      <S.ActionsContainer>
        <Button onClick={onClose} type="primary" ghost>
          Discard
        </Button>
        <Button onClick={() => onSave()} type="primary" ghost>
          Save
        </Button>
        <Button onClick={() => onSave(true)} type="primary">
          Save and Preview
        </Button>
      </S.ActionsContainer>
    </div>
  );
};

export default PreviewConfigurationEditor;
