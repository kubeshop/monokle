import {useMemo, useState} from 'react';

import {Button} from 'antd';

import {parse} from 'yaml';

import {CRD_SCHEMA_INTEGRATION} from '@models/integrations';

import {useAppSelector} from '@redux/hooks';
import {registeredKindHandlersSelector} from '@redux/selectors';

import {saveCRD} from '@utils/crds';

import {registerKindHandler} from '@src/kindhandlers';
import {extractKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

import ValidationPaneHeading from '../ValidationPaneHeading';

import * as S from './styled';

const CRDsSchemaValidation: React.FC = () => {
  const kindHandlers = useAppSelector(registeredKindHandlersSelector);
  const crdKindHandlers = useMemo(() => kindHandlers.filter(kh => kh.isCustom), [kindHandlers]);

  const crdsDir = useAppSelector(state => state.config.userCrdsDir);

  const [inputUrl, setInputUrl] = useState<string>();
  const [error, setError] = useState<string>();

  const registerCRD = async () => {
    if (!inputUrl || !crdsDir) {
      // TODO: validate if input is an actual URL
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
      }
    } catch {
      setError("Couldn't parse the YAML that was fetched from the provided URL.");
    }

    await saveCRD(crdsDir, text);
  };

  return (
    <div>
      <ValidationPaneHeading integration={CRD_SCHEMA_INTEGRATION} />
      <S.RegisterContainer>
        <p>Register CRD</p>
        <S.RegisterInput value={inputUrl} onChange={e => setInputUrl(e.target.value)} placeholder="Enter URL of CRD" />
        <Button type="primary" onClick={registerCRD}>
          Register
        </Button>
        {error && <p>{error}</p>}
      </S.RegisterContainer>

      <ul>
        {crdKindHandlers.map(c => (
          <li key={`${c.clusterApiVersion}_${c.kind}`}>
            {c.clusterApiVersion} - {c.kind}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CRDsSchemaValidation;
