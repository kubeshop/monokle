import * as k8s from '@kubernetes/client-node';

import {useEffect, useMemo, useRef, useState} from 'react';

import log from 'loglevel';
import stream from 'stream';
import {v4 as uuidv4} from 'uuid';

import {useAppSelector} from '@redux/hooks';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';

import {SearchInput} from '@monokle/components';
import {selectKubeconfig} from '@shared/utils/cluster/selectors';
import {createKubeClient} from '@shared/utils/kubeclient';

import * as S from './Logs.styled';

type LogLineType = {
  id: string;
  text: string;
};

const logOptions = {
  follow: true,
  tailLines: 50,
  pretty: false,
  timestamps: false,
};

const Logs: React.FC = () => {
  const kubeconfig = useAppSelector(selectKubeconfig);
  const selectedResource = useSelectedResource();

  const [errorMessage, setErrorMessage] = useState('');
  const [logs, setLogs] = useState<LogLineType[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = useMemo(
    () => logs.filter(l => l.text.toLowerCase().includes(searchValue.toLowerCase())),
    [logs, searchValue]
  );

  useEffect(() => {
    if (containerRef && containerRef.current) {
      const position = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      containerRef.current.scrollTop = position;
    }
  }, [logs]);

  useEffect(() => {
    if (!kubeconfig?.isValid) {
      return;
    }

    setLogs([]);
    const kc = createKubeClient(kubeconfig.path, kubeconfig.currentContext);
    const k8sLog = new k8s.Log(kc);
    const logStream = new stream.PassThrough();
    if (selectedResource && selectedResource.kind === 'Pod') {
      const containerName = selectedResource.object?.spec?.containers[0]?.name;

      logStream.on('data', (chunk: any) => {
        setLogs((prevLogs: LogLineType[]) => [
          ...prevLogs,
          {
            id: uuidv4(),
            text: chunk.toString(),
          },
        ]);
      });

      if (selectedResource.namespace) {
        k8sLog
          .log(selectedResource.namespace, selectedResource.name, containerName, logStream, logOptions)
          .then(() => {
            setErrorMessage('');
          })
          .catch((err: Error) => {
            setErrorMessage(`${err.name}: ${err.message}`);
            log.error(err);
          });
      }
    }

    return () => {
      if (logStream) {
        logStream.destroy();
      }
    };
  }, [kubeconfig, selectedResource]);

  if (errorMessage) {
    return <S.ErrorContainer>{errorMessage}</S.ErrorContainer>;
  }

  return (
    <S.LogContainer ref={containerRef}>
      <SearchInput
        style={{marginBottom: '16px'}}
        placeholder="Search through logs..."
        value={searchValue}
        onChange={(e: any) => setSearchValue(e.target.value)}
      />

      {filteredLogs.map(logLine => (
        <S.LogText key={logLine.id}>{logLine.text}</S.LogText>
      ))}
    </S.LogContainer>
  );
};

export default Logs;
