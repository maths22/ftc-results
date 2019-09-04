import React from 'react';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core';
import {setPassword, updateAccount, TOKEN_UPDATE, logout} from '../../actions/api';
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

const styles = theme => ({
  button: {
    margin: theme.spacing(1),
  },
  input: {
    width: '100%',
  }
});

const onSubmit = (values, dispatch) => {
  const qsVals = queryString.parse(window.location.search);
  const func = qsVals.reset_password ? setPassword : updateAccount;
  return dispatch(func(values)).then((resp) => {
    if(resp.error) {
      throw new SubmissionError(resp.payload.response.errors);
    }
    dispatch(clearUserDependentState());
    dispatch(logout());
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
    const {handleSubmit, pristine, submitting, invalid, error, classes} = this.props;
    const values = queryString.parse(window.location.search);
    return (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} justify="center">
            <Grid item xs={12}>
              { values.reset_password ? 'Reset Password' : 'Update Account' }
            </Grid>
            { values.reset_password ? null : <Grid item xs={12}>
              <Field name="email" component={renderTextField} label="Email" type="email"
                     className={classes.input}/>
            </Grid> }
            { values.reset_password ? null : <Grid item xs={12}>
              <Field name="current_password" component={renderTextField} label="Current password" type="password"
                     className={classes.input}/>
            </Grid> }
            <Grid item xs={12}>
              <Field name="password" component={renderTextField} label="New password" type="password"
                     className={classes.input}/>
            </Grid>
            <Grid item xs={12}>
              <Field name="password_confirmation" component={renderTextField} label="Password confirmation"
                     type="password" className={classes.input}/>
            </Grid>
            {error && <Grid item xs={12}>
              <Typography color="error">{error}</Typography>
            </Grid>}
            <Grid item xs={12}>
              <Button variant="contained" type="submit" color="primary" disabled={pristine || submitting || invalid}
                      className={classes.button}>
                Change
              </Button>
              {/*<Button variant="contained" type="button" disabled={pristine || submitting || invalid} onClick={reset} className={classes.button}>*/}
              {/*Clear*/}
              {/*</Button>*/}
            </Grid>
          </Grid>
        </form>
    );
  }
};

const mapStateToProps = (state) => {
  return { initialValues: {email: state.token['x-uid']} };
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
})(withStyles(styles)(UpdateAccount)));