import * as k8s from '@kubernetes/client-node';

import {useEffect, useMemo, useRef, useState} from 'react';

import {Skeleton} from 'antd';

import {debounce} from 'lodash';
import log from 'loglevel';
import stream from 'stream';
import {v4 as uuidv4} from 'uuid';

import {useAppSelector} from '@redux/hooks';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';

import {SearchInput} from '@monokle/components';
import {Colors} from '@shared/styles/colors';
import {selectKubeconfig} from '@shared/utils/cluster/selectors';
import {createKubeClient} from '@shared/utils/kubeclient';
import {trackEvent} from '@shared/utils/telemetry';

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

const matchingCharactersLabel = (label: string, searchingValue: string) => {
  const inputValue = searchingValue.replaceAll('\\', '\\\\');
  const regex = new RegExp(`(${inputValue})`, 'gi');
  const parts = label.split(regex);

  return parts.map((part, index) => {
    const key = `${label}-${index}`;

    if (part) {
      if (part.toLowerCase() === searchingValue.toLowerCase()) {
        return (
          <span key={key} style={{color: Colors.geekblue9}}>
            {part}
          </span>
        );
      }
      return part;
    }

    return '';
  });
};

const Logs: React.FC = () => {
  const kubeconfig = useAppSelector(selectKubeconfig);
  const selectedResource = useSelectedResource();

  const [inputFocused, setInputFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogLineType[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = useMemo(() => {
    const currentLogs = logs.filter(l => l.text.toLowerCase().includes(searchValue.toLowerCase()));

    return currentLogs.map(logLine => ({
      id: logLine.id,
      label: <span>{matchingCharactersLabel(logLine.text, searchValue)}</span>,
    }));
  }, [logs, searchValue]);

  const debouncedSetSearchValue = useMemo(() => {
    return debounce(e => {
      setSearchValue(e.target.value);
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      debouncedSetSearchValue.cancel();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!inputFocused || !searchValue || !selectedResource) {
      return;
    }

    trackEvent('logs/search', {resourceKind: selectedResource.kind});
    setInputFocused(false);
  }, [searchValue, inputFocused, selectedResource]);

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

    setIsLoading(true);
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
        setIsLoading(false);
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
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        style={{marginBottom: '16px'}}
        placeholder="Search through logs..."
        onChange={debouncedSetSearchValue}
      />

      <S.LogsContainer>
        {isLoading ? (
          <Skeleton />
        ) : !filteredLogs.length ? (
          <S.LogText>No logs found</S.LogText>
        ) : (
          filteredLogs.map(logLine => <S.LogText key={logLine.id}>{logLine.label}</S.LogText>)
        )}
      </S.LogsContainer>
    </S.LogContainer>
  );
};

export default Logs;
