import React, {Component} from 'react';
import connect from 'react-redux/es/connect/connect';
import {setTitle} from '../../actions/ui';
import {
  postRequest
} from '../../actions/uploaderApi';
import {API_BASE} from '../../actions/api';

import Uploader from './uploader/index';

class OldUploader extends Component {
  state = {};

  componentDidUpdate(oldProps) {
    if(oldProps.localServer.uploadRunning && !this.props.localServer.uploadRunning) {
      if(this.uploader) {
        this.uploader.stopUpload();
      }
    }

    if(!oldProps.localServer.uploadRunning && this.props.localServer.uploadRunning) {
      this.buildUploader();
      this.uploader.startUpload();
    }
  }

  componentWillUnmount() {
    if(this.uploader) {
      this.uploader.stopUpload();
    }
  }

  buildUploader() {
    this.uploader = new Uploader(
      this.props.localServer.hostname,
      this.props.localServer.port,
      this.props.localServer.event,
      this.props.season,
      this.props.event,
      API_BASE,
      this.props.postRequest,
      this.setState
    );
  }

  render() {

    const {localServer} = this.props;
    return (
        localServer.uploadRunning ? <div>
          Upload running!<br/>
          Last attempt: {this.state.success === true ? ('success at ' + this.state.date.toLocaleString()) : null} {this.state.success === false ? ('failure at ' + this.state.date.toLocaleString()) : null}
        </div> : null
    );
  }
}

const mapStateToProps = (state, props) => {
  const ret = {};
  ret.localServer = state.localScoring.server;
  ret.local = state.localScoring;
  return ret;
};

const mapDispatchToProps = {
  postRequest,
  setTitle
};

export default connect(mapStateToProps, mapDispatchToProps)(OldUploader);