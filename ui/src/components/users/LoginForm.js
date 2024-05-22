import React from 'react';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {login, resetPassword} from '../../actions/api';
import {clearUserDependentState} from '../../actions/util';

const validate = values => {
  const errors = {};
  const requiredFields = [
    'email'
  ];
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
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
        error={touched && !!error}
        helperText={touched && error}
        {...input}
        {...custom}
    />
);

const onSubmit = (values, dispatch) => {
  return dispatch(login(values)).then((resp) => {
    if(resp.error) {
      throw new SubmissionError({_error: resp.payload.response.errors});
    }
    dispatch(clearUserDependentState());
    return true;
  });
};

const onResetPassword = (values, dispatch) => {
  function getRootUrl(url) {
    return url.toString().replace(/^(.*\/\/[^/?#]*).*$/,'$1');
  }

  return dispatch(resetPassword(values, getRootUrl(window.location) + '/account')).then((resp) => {
    if(resp.error) {
      throw new SubmissionError({_error: resp.payload.response.errors});
    }
    return true;
  });
};

const LoginForm = props => {
  const { handleSubmit, pristine, submitting, invalid, error } = props;
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <Field name="email" component={renderTextField} label="Email" sx={{width: '100%'}} />
        </Grid>
        <Grid item xs={12}>
          <Field name="password" component={renderTextField} label="Password" type="password" sx={{width: '100%'}} />
        </Grid>
        {error && <Grid item xs={12}>
          <Typography color="error">{error.join(', ')}</Typography>
        </Grid> }
        <Grid item xs={12}>
          <Button variant="contained" type="submit" color="primary" disabled={pristine || submitting || invalid}>
            Login
          </Button>
          <Button type="submit" onClick={handleSubmit(onResetPassword)} color="primary" disabled={pristine || submitting} sx={{marginLeft: 1}}>
            Forgot?
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default reduxForm({
  form: 'LoginForm', // a unique identifier for this form
  validate,
  // asyncValidate,
  onSubmit
})(LoginForm);