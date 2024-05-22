import React from 'react';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {createAccount} from '../../actions/api';
import {clearUserDependentState} from '../../actions/util';

const validate = values => {
  const errors = {};
  const requiredFields = [
    'email',
    'name',
    'password',
    'password_confirmation'
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
  function getRootUrl(url) {
    return url.toString().replace(/^(.*\/\/[^/?#]*).*$/,'$1');
  }

  return dispatch(createAccount(values, getRootUrl(window.location) + '/account/confirm')).then((resp) => {
    if(resp.error) {
      throw new SubmissionError(resp.payload.response.errors);
    }
    window.alert('Registration successful.\nCheck your email to confirm your account and sign in.');
    dispatch(clearUserDependentState());
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
          <Field name="name" component={renderTextField} label="Name" sx={{width: '100%'}} />
        </Grid>
        <Grid item xs={12}>
          <Field name="password" component={renderTextField} label="Password" type="password" sx={{width: '100%'}} />
        </Grid>
        <Grid item xs={12}>
          <Field name="password_confirmation" component={renderTextField} label="Confirm password" type="password" sx={{width: '100%'}} />
        </Grid>
        {error && <Grid item xs={12}>
          <Typography color="error">{error.join(', ')}</Typography>
        </Grid> }
        <Grid item xs={12}>
          <Button variant="contained" type="submit" color="primary" disabled={pristine || submitting || invalid}>
            Register
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default reduxForm({
  form: 'RegisterForm', // a unique identifier for this form
  validate,
  // asyncValidate,
  onSubmit
})(LoginForm);