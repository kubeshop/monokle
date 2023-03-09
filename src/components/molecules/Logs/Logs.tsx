import * as k8s from '@kubernetes/client-node';

import {useEffect, useState} from 'react';

import log from 'loglevel';
import stream from 'stream';
import {v4 as uuidv4} from 'uuid';

import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';

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

const Logs = () => {
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const selectedResource = useSelectedResource();
  const [logs, setLogs] = useState<LogLineType[]>([]);

  useEffect(() => {
    setLogs([]);
    const kc = createKubeClient(kubeConfigPath, kubeConfigContext);
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
          .catch((err: Error) => {
            log.error(err);
          });
      }
    }

    return () => {
      logStream.destroy();
    };
  }, [kubeConfigContext, kubeConfigPath, selectedResource]);

  return (
    <S.LogContainer>
      {logs.map(logLine => (
        <S.LogText key={logLine.id}>{logLine.text}</S.LogText>
      ))}
      ;
    </S.LogContainer>
  );
};

export default Logs;
