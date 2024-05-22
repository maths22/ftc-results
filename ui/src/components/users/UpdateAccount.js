import React from 'react';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {setPassword, updateAccount, activateAccount, TOKEN_UPDATE} from '../../actions/api';
import {clearUserDependentState} from '../../actions/util';
import {setTitle} from '../../actions/ui';
import {connect} from 'react-redux';
import queryString from 'query-string';
import { push } from 'connected-react-router';


const validate = values => {
  const errors = {};
  // const requiredFields = [
  //   'password',
  //   'password_confirmation'
  // ];
  // requiredFields.forEach(field => {
  //   if (!values[field]) {
  //     errors[field] = 'Required';
  //   }
  // });
  if (
      values.email &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
  ) {
    errors.email = 'Invalid email address';
  }
  return errors;
};

const renderTextField = ({
                           input,
                           label,
                           meta: { touched, error },
                           ...custom
                         }) => (
    <TextField
        label={label}
        error={touched && error}
        helperText={touched && error}
        {...input}
        {...custom}
    />
);


const headings = {
  reset_password: 'Reset Password',
  activate_account: 'Activate Account',
  update_account: 'Update Account'
};

const submitFunctions = {
  reset_password: setPassword,
  activate_account: activateAccount,
  update_account: updateAccount
};

const onSubmit = (values, dispatch) => {
  const qsVals = queryString.parse(window.location.search);
  let type = 'update_account';
  if(qsVals.reset_password_token) type = 'reset_password';
  if(qsVals.invitation_token) type = 'activate_account';
  const func = submitFunctions[type];
  let base_attrs = {};
  if(qsVals.reset_password_token) {
    base_attrs.reset_password_token = qsVals.reset_password_token;
  }
  if(qsVals.invitation_token) {
    base_attrs.invitation_token = qsVals.invitation_token;
  }
  Object.assign(base_attrs, values);
  return dispatch(func(base_attrs)).then((resp) => {
    if(resp.error) {
      throw new SubmissionError(resp.payload.response.errors || { _error: resp.payload.message });
    }
    dispatch(clearUserDependentState());
    dispatch(push('/'));
    //TODO better messaging
    return true;
  });
};

class UpdateAccount extends React.Component {
  componentDidMount() {
    const values = queryString.parse(window.location.search);
    if(values['token']) {
      this.props.setToken(values);
    }
    this.props.setTitle('Update Account');
  }

  componentWillUnmount() {
    this.props.setTitle(null);
  }

  render() {
    const {handleSubmit, pristine, submitting, invalid, error} = this.props;
    const values = queryString.parse(window.location.search);
    let type = 'update_account';
    if(values.reset_password_token) type = 'reset_password';
    if(values.invitation_token) type = 'activate_account';
    return (
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12}>
            <Typography variant='h5'>{ headings[type] }</Typography>
          </Grid>
          { type === 'update_account' ? <Grid item xs={12}>
            <Field name="email" component={renderTextField} label="Email" type="email" required={true}
                   sx={{width: '100%'}} />
          </Grid> : null }
          { type !== 'reset_password' ? <Grid item xs={12}>
            <Field name="name" component={renderTextField} label="Name" required={true}
                   sx={{width: '100%'}} />
          </Grid> : null }
          { type === 'update_account' ? <Grid item xs={12}>
            <Field name="current_password" component={renderTextField} label="Current password" type="password"
                   sx={{width: '100%'}} />
          </Grid> : null }
          <Grid item xs={12}>
            <Field name="password" component={renderTextField} label="New password" type="password"
                   sx={{width: '100%'}} />
          </Grid>
          <Grid item xs={12}>
            <Field name="password_confirmation" component={renderTextField} label="Password confirmation"
                   type="password" sx={{width: '100%'}} />
          </Grid>
          {error && <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>}
          <Grid item xs={12}>
            <Button variant="contained" type="submit" color="primary" disabled={pristine || submitting || invalid}>
              { type === 'activate_account' ? 'Activate' : 'Change' }
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }
};

const mapStateToProps = (state) => {
  const values = queryString.parse(window.location.search);
  const uid = state.token['x-uid'] || values.uid;
  return {
    enableReinitialize: true,
    initialValues: {
      email: uid,
      name: state.users && state.users[uid] ? state.users[uid].name : null
    }
  };
};

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
  setTitle
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  form: 'UpdateAccount', // a unique identifier for this form
  validate,
  push,
  // asyncValidate,
  onSubmit
})(UpdateAccount));