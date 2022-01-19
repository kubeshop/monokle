import React from 'react';

import log from 'loglevel';

class TemplateFormErrorBoundary extends React.Component<any, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = {hasError: false};
  }
  static getDerivedStateFromError() {
    return {hasError: true};
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    log.warn(error, errorInfo);
  }
  render() {
    const {hasError} = this.state;
    const {children} = this.props;
    if (hasError) {
      return <p>Something went wrong.</p>;
    }
    return children;
  }
}

export default TemplateFormErrorBoundary;
