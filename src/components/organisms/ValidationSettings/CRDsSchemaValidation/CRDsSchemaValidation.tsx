import {useMemo, useState} from 'react';

import {Button, Collapse, Divider} from 'antd';

import {FolderAddOutlined, PlusOutlined} from '@ant-design/icons';

import {groupBy} from 'lodash';
import log from 'loglevel';
import {parse} from 'yaml';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {registeredKindHandlersSelector} from '@redux/selectors/resourceKindSelectors';

import {FileExplorer} from '@components/atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {saveCRD} from '@utils/crds';
import {isValidUrl} from '@utils/urls';

import {registerKindHandler} from '@src/kindhandlers';
import {extractKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

import {AlertEnum} from '@shared/models/alert';
import {CRD_SCHEMA_INTEGRATION} from '@shared/models/validationPlugins';
import {trackEvent} from '@shared/utils';
import {readFile} from '@shared/utils/fileSystem';

import ValidationPaneHeading from '../ValidationPaneHeading';
import CRDItem from './CRDItem';
import * as S from './CRDsSchemaValidation.styled';

const CRDsSchemaValidation: React.FC = () => {
  const dispatch = useAppDispatch();
  const kindHandlers = useAppSelector(registeredKindHandlersSelector);
  const crdKindHandlers = useMemo(() => kindHandlers.filter(kh => kh.isCustom), [kindHandlers]);

  const groupedCrdKindHandlers = useMemo(() => {
    const crdsMap = groupBy(crdKindHandlers, crd => crd.clusterApiVersion);
    return Object.entries(crdsMap).sort((a, b) => a[0].localeCompare(b[0]));
  }, [crdKindHandlers]);

  const crdsDir = useAppSelector(state => state.config.userCrdsDir);

  const [isRegistering, setIsRegistering] = useState(false);
  const [inputUrl, setInputUrl] = useState<string>();
  const [inputFilePaths, setInputFilePaths] = useState<string[]>();
  const [errors, setErrors] = useState<string[]>();

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({filePaths}) => {
      setErrors(undefined);
      setInputFilePaths(filePaths);
    },
    {
      allowMultiple: true,
      acceptedFileExtensions: ['yaml', 'yml'],
    }
  );

  const registerCRD = async (crdContent: string, source: string) => {
    if (!crdsDir) {
      return;
    }

    try {
      const yamlContent = parse(crdContent);
      const newKindHandler = extractKindHandler(yamlContent);
      if (newKindHandler) {
        registerKindHandler(newKindHandler, false);
      } else {
        setErrors(errs => [...(errs || []), `Unable to register CRD from ${source}`]);
        return false;
      }
      dispatch(
        setAlert({
          title: 'Registered CRD',
          message: `Successfully registered the ${newKindHandler?.kind} CRD from ${newKindHandler?.clusterApiVersion}`,
          type: AlertEnum.Success,
        })
      );
    } catch (e: any) {
      log.error(e.message);
      setErrors(errs => [...(errs || []), `Unable to register CRD from ${source}`]);
      return false;
    }

    await saveCRD(crdsDir, crdContent);
    return true;
  };

  const onClickRegister = async () => {
    setErrors(undefined);

    if (!crdsDir || (!inputUrl && !inputFilePaths?.length)) {
      return;
    }

    if (inputUrl?.trim().length) {
      if (!isValidUrl(inputUrl)) {
        setErrors(['The input is not a valid URL.']);
        return;
      }

      const response = await fetch(inputUrl);
      const text = await response.text();

      const success = await registerCRD(text, inputUrl);

      if (success) {
        cancelRegistering();
        trackEvent('configure/crds_register', {from: 'url'});
      }
      return;
    }

    if (inputFilePaths?.length) {
      const readFilesPromises = inputFilePaths.map(filePath => readFile(filePath));
      const fileContents = await Promise.all(readFilesPromises);

      const registerPromises = fileContents.map((content, index) => registerCRD(content, inputFilePaths[index]));

      const result = await Promise.all(registerPromises);

      const indexesToRemove: number[] = [];

      result.forEach((success, index) => {
        if (success) {
          indexesToRemove.push(index);
        }
      });

      setInputFilePaths(filePaths => {
        const newFilePaths: string[] = [];
        filePaths?.forEach((filePath, index) => {
          if (indexesToRemove.includes(index)) {
            return;
          }
          newFilePaths.push(filePath);
        });
        return newFilePaths;
      });

      if (indexesToRemove.length === inputFilePaths.length) {
        trackEvent('configure/crds_register', {from: 'file'});
        cancelRegistering();
      }
    }
  };

  const onClickClear = () => {
    setInputFilePaths(undefined);
  };

  const cancelRegistering = () => {
    setIsRegistering(false);
    setInputUrl(undefined);
    setInputFilePaths(undefined);
    setErrors(undefined);
  };

  const onInputUrlChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setErrors(undefined);
    setInputUrl(e.target.value);
  };

  return (
    <>
      <ValidationPaneHeading plugin={CRD_SCHEMA_INTEGRATION} />
      <S.Container>
        {isRegistering ? (
          <S.RegisterContainer>
            <S.FirstDivider>Register CRD from URL</S.FirstDivider>
            <S.RegisterInput
              value={inputUrl}
              onChange={onInputUrlChange}
              placeholder="Enter URL of CRD"
              disabled={Boolean(inputFilePaths?.length)}
            />
            <Divider>Or register from files</Divider>
            <S.FileBrowserContainer $isVertical={Boolean(inputFilePaths?.length)}>
              <FileExplorer {...fileExplorerProps} />
              {!inputFilePaths?.length ? (
                <S.FilesPlaceholder>No files selected.</S.FilesPlaceholder>
              ) : (
                <S.FileUL>
                  {inputFilePaths?.map(filePath => (
                    <S.FileLI key={filePath}>{filePath}</S.FileLI>
                  ))}
                </S.FileUL>
              )}
              <S.FileBrowserButtons>
                {inputFilePaths?.length && (
                  <Button onClick={onClickClear} type="ghost">
                    Clear
                  </Button>
                )}
                <Button
                  disabled={Boolean(inputUrl?.length)}
                  icon={<FolderAddOutlined />}
                  type="ghost"
                  onClick={openFileExplorer}
                >
                  Browse files
                </Button>
              </S.FileBrowserButtons>
            </S.FileBrowserContainer>

            <Divider />
            {errors?.length && errors.map(error => <S.Error key={error}>{error}</S.Error>)}

            <S.RegisterActions>
              <S.CancelButton onClick={cancelRegistering}>Cancel</S.CancelButton>
              <Button type="primary" onClick={onClickRegister}>
                Register
              </Button>
            </S.RegisterActions>
          </S.RegisterContainer>
        ) : (
          <Button onClick={() => setIsRegistering(true)} type="primary" icon={<PlusOutlined />}>
            Register new CRD
          </Button>
        )}
        <S.Subtitle>Registered CRDs</S.Subtitle>
        <Collapse>
          {groupedCrdKindHandlers.map(([apiVersion, crds]) => (
            <Collapse.Panel header={apiVersion} key={apiVersion}>
              <S.List>
                {crds.map(crd => (
                  <CRDItem key={crd.kind} crd={crd} />
                ))}
              </S.List>
            </Collapse.Panel>
          ))}
        </Collapse>
      </S.Container>
    </>
  );
};

export default CRDsSchemaValidation;
