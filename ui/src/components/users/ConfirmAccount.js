import React from 'react';
import {TOKEN_UPDATE, verifyToken} from '../../actions/api';
import {connect} from 'react-redux';
import queryString from 'query-string';
import { push } from 'connected-react-router';



class ConfirmAccount extends React.Component {
  componentDidMount() {
    const values = queryString.parse(window.location.search);
    if(values['token']) {
      this.props.setToken(values);
      this.props.verifyToken();
      this.props.push('/');
    }
  }

  render() {
    return 'An error has occured';
  }
};

const mapStateToProps = (state) => ({});


const setToken = (values) => {
  return {
    type: TOKEN_UPDATE,
    payload: {
      'x-access-token': values['token'],
      'x-client': values['client_id'],
      'x-expiry': values['expiry'],
      'x-uid': values['uid'],
      'x-token-type': values['bearer']
    }
  };
};

const mapDispatchToProps = {
  setToken,
  verifyToken,
  push
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmAccount);