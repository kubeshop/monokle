import * as S from './Logs.styled';

// type LogLineType = {
//   id: string;
//   text: string;
// };

// const logOptions = {
//   follow: true,
//   tailLines: 50,
//   pretty: false,
//   timestamps: false,
// };

const Logs = () => {
  // const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  // const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  // const selectedResourceId = useAppSelector(state => state.main.selectedResourceId) || 0;
  // const resource = useAppSelector(state => state.main.resourceMap[selectedResourceId]);
  // const [logs, setLogs] = useState<LogLineType[]>([]);

  // useEffect(() => {
  //   setLogs([]);
  //   const kc = createKubeClient(kubeConfigPath, kubeConfigContext);
  //   const k8sLog = new k8s.Log(kc);
  //   const logStream = new stream.PassThrough();
  //   if (resource && resource.kind === 'Pod') {
  //     const containerName = resource.content?.spec?.containers[0]?.name;

  //     logStream.on('data', (chunk: any) => {
  //       setLogs((prevLogs: LogLineType[]) => [
  //         ...prevLogs,
  //         {
  //           id: uuidv4(),
  //           text: chunk.toString(),
  //         },
  //       ]);
  //     });

  //     if (resource.namespace) {
  //       k8sLog.log(resource.namespace, resource.name, containerName, logStream, logOptions).catch((err: Error) => {
  //         log.error(err);
  //       });
  //     }
  //   }

  //   return () => {
  //     logStream.destroy();
  //   };
  // }, [kubeConfigContext, kubeConfigPath, resource]);

  return (
    <S.LogContainer>
      {([] as any).map((logLine: any) => (
        <S.LogText key={logLine.id}>{logLine.text}</S.LogText>
      ))}
      ;
    </S.LogContainer>
  );
};

export default Logs;
