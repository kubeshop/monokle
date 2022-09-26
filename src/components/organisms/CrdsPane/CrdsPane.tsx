import {useMemo, useState} from 'react';

import {Button} from 'antd';

import {parse} from 'yaml';

import {useAppSelector} from '@redux/hooks';
import {registeredKindHandlersSelector} from '@redux/selectors';

import {TitleBar} from '@molecules';

import {registerKindHandler} from '@src/kindhandlers';
import {extractKindHandler} from '@src/kindhandlers/common/customObjectKindHandler';

import * as S from './CrdsPane.styled';

const CrdsPane: React.FC = () => {
  const kindHandlers = useAppSelector(registeredKindHandlersSelector);
  const crdKindHandlers = useMemo(() => kindHandlers.filter(kh => kh.isCustom), [kindHandlers]);

  const [inputUrl, setInputUrl] = useState<string>();
  const [error, setError] = useState<string>();

  const registerCRD = async () => {
    if (!inputUrl) {
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
  };

  return (
    <div>
      <TitleBar title="Custom Resource Definitions" closable />
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
          <li>
            {c.clusterApiVersion} - {c.kind}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CrdsPane;
