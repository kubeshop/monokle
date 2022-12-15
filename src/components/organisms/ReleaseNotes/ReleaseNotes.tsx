import {shell} from 'electron';

import {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';

import {Button, Skeleton} from 'antd';

import path from 'path';
import semver from 'semver';

import {fetchAppVersion} from '@utils/appVersion';

import {loadResource} from '@shared/utils/resource';
import {openUrlInExternalBrowser} from '@shared/utils/shell';

import * as S from './styled';

type ReleaseNotesProps = {
  onClose: () => void;
  singleColumn?: boolean;
};

const ReleaseNotes: React.FC<ReleaseNotesProps> = ({onClose, singleColumn}) => {
  const [title, setTitle] = useState<string>();
  const [learnMoreUrl, setLearnMoreUrl] = useState<string>();
  const [markdown, setMarkdown] = useState<string>();
  const [base64svg, setBase64svg] = useState<string>();
  const [callToAction, setCallToAction] = useState<{text: string; url: string} | undefined>();

  useEffect(() => {
    fetchAppVersion().then(version => {
      const parsedVersion = semver.parse(version);
      if (!parsedVersion) {
        onClose();
        return;
      }
      const releaseVersion = `${parsedVersion.major}.${parsedVersion.minor}`;
      const rawVersionInfo = loadResource(path.join('releaseNotes', releaseVersion, `${releaseVersion}.json`));
      const rawMarkdown = loadResource(path.join('releaseNotes', releaseVersion, `${releaseVersion}.md`));
      const rawSvg = loadResource(path.join('releaseNotes', releaseVersion, `${releaseVersion}.svg`));
      if (!rawVersionInfo || !rawMarkdown || !rawSvg) {
        onClose();
        return;
      }
      const versionInfo = JSON.parse(rawVersionInfo);
      setTitle(versionInfo.title);
      setLearnMoreUrl(versionInfo.learnMoreUrl);
      setCallToAction(versionInfo.callToAction);
      setMarkdown(rawMarkdown);
      setBase64svg(Buffer.from(rawSvg).toString('base64'));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!title || !learnMoreUrl || !markdown) {
    return <Skeleton />;
  }

  return (
    <span id="NewRelease">
      <S.Container $singleColumn={singleColumn}>
        <S.Content>
          <S.Title>{title}</S.Title>
          <ReactMarkdown
            components={{
              li({children}) {
                return <S.ListItem>{children}</S.ListItem>;
              },
              a({href, children, ...props}) {
                return (
                  <a onClick={() => openUrlInExternalBrowser(href)} {...props}>
                    {children}
                  </a>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </S.Content>
        <S.Illustration $singleColumn={singleColumn}>
          <S.Image src={`data:image/svg+xml;base64,${base64svg}`} alt="Release illustration" />
        </S.Illustration>
      </S.Container>
      {callToAction && (
        <S.CallToActionButton type="primary" onClick={() => shell.openExternal(callToAction.url)}>
          {callToAction.text}
        </S.CallToActionButton>
      )}
      {!singleColumn && (
        <S.Actions>
          <Button type="ghost" onClick={() => openUrlInExternalBrowser(learnMoreUrl)}>
            Learn more
          </Button>
          <S.ConfirmButton onClick={onClose} type={callToAction ? 'ghost' : 'primary'}>
            Got it
          </S.ConfirmButton>
        </S.Actions>
      )}
    </span>
  );
};

export default ReleaseNotes;
