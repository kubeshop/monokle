import {useEffect, useState} from 'react';

interface CopyToClipboardOptions {
  timeoutInMs?: number;
}

export const useCopyToClipboard = (textToCopy: string, options: CopyToClipboardOptions = {timeoutInMs: 1500}) => {
  const [isCopied, setCopyToClipboardState] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isCopied) {
      navigator.clipboard.writeText(textToCopy);
      timeout = setTimeout(() => {
        setCopyToClipboardState(false);
      }, options.timeoutInMs);
    }

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCopied]);

  return {isCopied, setCopyToClipboardState};
};
