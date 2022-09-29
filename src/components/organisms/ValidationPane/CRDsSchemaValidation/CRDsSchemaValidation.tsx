import {useMemo, useState} from 'react';

import {Button, Collapse} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import _ from 'lodash';
import {parse} from 'yaml';

import {AlertEnum} from '@models/alert';
import {CRD_SCHEMA_INTEGRATION} from '@models/integrations';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {registeredKindHandlersSelector} from '@redux/selectors';

import {saveCRD} from '@utils/crds';
import {isValidUrl} from '@utils/urls';

import {registerKindHandler} from '@src/kindhandlers';
import {extractKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

import ValidationPaneHeading from '../ValidationPaneHeading';
import * as S from './CRDsSchemaValidation.styled';

const CRDsSchemaValidation: React.FC = () => {
  const dispatch = useAppDispatch();
  const kindHandlers = useAppSelector(registeredKindHandlersSelector);
  const crdKindHandlers = useMemo(() => kindHandlers.filter(kh => kh.isCustom), [kindHandlers]);

  const groupedCrdKindHandlers = useMemo(() => {
    const crdsMap = _.groupBy(crdKindHandlers, crd => crd.clusterApiVersion);
    return Object.entries(crdsMap).sort((a, b) => a[0].localeCompare(b[0]));
  }, [crdKindHandlers]);

  const crdsDir = useAppSelector(state => state.config.userCrdsDir);

  const [isRegistering, setIsRegistering] = useState(false);
  const [inputUrl, setInputUrl] = useState<string>();
  const [error, setError] = useState<string>();

  const registerCRD = async () => {
    if (!inputUrl || !crdsDir) {
      return;
    }
    if (inputUrl && !isValidUrl(inputUrl)) {
      setError('The input is not a valid URL.');
      return;
    }
    const response = await fetch(inputUrl);
    const text = await response.text();

    try {
      const yamlContent = parse(text);
      const newKindHandler = extractKindHandler(yamlContent);
      if (newKindHandler) {
        registerKindHandler(newKindHandler, false);
      } else {
        setError('Unable to register CRD.');
        return;
      }
      dispatch(
        setAlert({
          title: 'Registered CRD',
          message: `Successfully registered the ${newKindHandler?.kind} CRD from ${newKindHandler?.clusterApiVersion}`,
          type: AlertEnum.Success,
        })
      );
    } catch {
      setError("Couldn't parse the YAML that was fetched from the provided URL.");
      return;
    }

    await saveCRD(crdsDir, text);
    cancelRegistering();
  };

  const cancelRegistering = () => {
    setIsRegistering(false);
    setInputUrl(undefined);
    setError(undefined);
  };

  return (
    <div>
      <ValidationPaneHeading integration={CRD_SCHEMA_INTEGRATION} />
      <S.Container>
        {isRegistering ? (
          <S.RegisterContainer>
            <h3>Register CRD</h3>
            <S.RegisterInput
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="Enter URL of CRD"
            />
            {error && <S.Error>{error}</S.Error>}
            <S.CancelButton onClick={cancelRegistering}>Cancel</S.CancelButton>
            <Button type="primary" onClick={registerCRD}>
              Register
            </Button>
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
                  <li key={crd.kind}>{crd.kind}</li>
                ))}
              </S.List>
            </Collapse.Panel>
          ))}
        </Collapse>
      </S.Container>
    </div>
  );
};

export default CRDsSchemaValidation;
