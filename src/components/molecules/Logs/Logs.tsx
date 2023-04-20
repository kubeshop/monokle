import * as k8s from '@kubernetes/client-node';

import {memo, useEffect, useRef, useState} from 'react';

import log from 'loglevel';
import stream from 'stream';
import {v4 as uuidv4} from 'uuid';

import {selectKubeconfig} from '@redux/cluster/selectors';
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
  const kubeconfig = useAppSelector(selectKubeconfig);
  const selectedResource = useSelectedResource();
  const [logs, setLogs] = useState<LogLineType[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

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
          .catch((err: Error) => {
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

  return (
    <S.LogContainer ref={containerRef}>
      {logs.map(logLine => (
        <LogItem key={logLine.id} logLine={logLine} />
      ))}
    </S.LogContainer>
  );
};

export default Logs;

export const LogItem = memo(({logLine}: any) => {
  return <S.LogText key={logLine.id}>{logLine.text}</S.LogText>;
});
