import {useEffect, useState} from 'react';

import {v4 as uuidv4} from 'uuid';

import {useAppSelector} from '@redux/hooks';
import {kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/selectors';

import {createKubeClient} from '@utils/kubeclient';

import * as S from './Logs.styled';

const stream = require('stream');
const k8s = require('@kubernetes/client-node');
const log = require('loglevel');

type LogLineType = {
  id: string;
  text: string;
};

const Logs = () => {
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId) || 0;
  const resource = useAppSelector(state => state.main.resourceMap[selectedResourceId]);
  const [logs, setLogs] = useState<LogLineType[]>([]);

  useEffect(() => {
    setLogs([]);
    const kc = createKubeClient(kubeConfigPath, kubeConfigContext);
    const k8sLog = new k8s.Log(kc);
    const logStream = new stream.PassThrough();
    if (resource) {
      const containerName = resource.content?.spec?.containers[0]?.name;

      logStream.on('data', (chunk: any) => {
        setLogs((prevLogs: LogLineType[]) => [
          ...prevLogs,
          {
            id: uuidv4(),
            text: chunk.toString(),
          },
        ]);
      });

      k8sLog
        .log(resource.namespace, resource.name, containerName, logStream, {
          follow: true,
          tailLines: 50,
          pretty: false,
          timestamps: false,
        })
        .catch((err: Error) => {
          log.error(err);
        })
        .then((req: any) => {
          if (req) {
            setTimeout(() => {
              req.abort();
            }, 5000);
          }
        });
    }

    return () => {
      logStream.destroy();
    };
  }, [kubeConfigContext, kubeConfigPath, resource]);

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
