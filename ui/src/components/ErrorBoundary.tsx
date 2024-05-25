import * as Sentry from '@sentry/browser';
import {Component, ErrorInfo, ReactNode} from "react";

interface Props {
  children: ReactNode,
  message?: string
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error });
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        // @ts-expect-error
        scope.setExtra(key, errorInfo[key]);
      });
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.error) {
      //render fallback UI
      return (<div>
            <p>{this.props.message || 'An error has occured!'}</p>
            {/*TODO FIX THIS*/}
          {/*<TextLink onClick={() => Sentry.showReportDialog()}>Report feedback</TextLink>*/}
        </div>
      );
    } else {
      //when there's not an error, render children untouched
      return this.props.children;
    }
  }
}