import * as k8s from '@kubernetes/client-node';

import {memo, useEffect, useRef, useState} from 'react';

import log from 'loglevel';
import stream from 'stream';
import {v4 as uuidv4} from 'uuid';

import {useSelectedResource} from '@redux/selectors/resourceSelectors';

import {useK8sClient} from '@src/K8sClientContext';

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
  const selectedResource = useSelectedResource();
  const [logs, setLogs] = useState<LogLineType[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const {k8sClient} = useK8sClient();
  useEffect(() => {
    if (containerRef && containerRef.current) {
      const position = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      containerRef.current.scrollTop = position;
    }
  }, [logs]);

  useEffect(() => {
    setLogs([]);
    const kc = k8sClient;
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
  }, [selectedResource, k8sClient]);

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
