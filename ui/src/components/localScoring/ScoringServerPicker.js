import React, {Component} from 'react';
import {Field, reduxForm} from 'redux-form';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core';
import connect from 'react-redux/es/connect/connect';
import {getLocalVersion, localClearEvents, setServer} from '../../actions/localScoringApi';

const validate = values => {
  const errors = {};
  const requiredFields = [
    'hostname',
    'port'
  ];
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
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
  dispatch(localClearEvents());
  dispatch(setServer(values.hostname, values.port));
};

class ScoringServerPicker extends Component {
  componentDidMount() {
    if(this.props.localServer.verified === null) {
      this.props.getLocalVersion();
    }
  }

  componentDidUpdate(oldProps) {
    if(oldProps.localServer.hostname !== this.props.localServer.hostname
      || oldProps.localServer.port !== this.props.localServer.port) {

      if(this.props.localServer.verified === null) {
        this.props.getLocalVersion();
      }
    }
    if(this.props.disabled && !oldProps.disabled && !this.props.pristine) {
      this.props.reset();
    }
  }

  render() {
    const {handleSubmit, pristine, submitting, invalid, error, classes, className, localServer, disabled} = this.props;
    return (
        <form onSubmit={handleSubmit} className={className}>
          <Grid container spacing={3} justify="center">
            <Grid item xs={4}>
              <Field name="hostname" component={renderTextField} disabled={disabled} label="Hostname" className={classes.input}/>
            </Grid>
            <Grid item xs={2}>
              <Field name="port" component={renderTextField} disabled={disabled} label="Port"  className={classes.input}/>
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" type="submit" color="primary" disabled={pristine || submitting || invalid}
                      className={classes.button}>
                Update
              </Button>
              {/*<Button variant="contained" type="button" disabled={pristine || submitting || invalid} onClick={reset} className={classes.button}>*/}
              {/*Clear*/}
              {/*</Button>*/}
            </Grid>
            {error && <Grid item xs={12}>
              <Typography color="error">{error.join(', ')}</Typography>
            </Grid>}
            {this.props.localServer.verified === false ? <Grid item xs={12}>
              <Typography color="error">{'Could not connect to scoring system at ' +
                `http://${localServer.hostname}:${localServer.port}`}</Typography>
            </Grid> : null}
          </Grid>
        </form>
    );
  }
}

const mapStateToProps = (state) => {
  const ret = {};
  ret.localServer = state.localScoring.server;
  ret.initialValues = {hostname: ret.localServer.hostname, port: ret.localServer.port};
  return ret;
};

const mapDispatchToProps = {
  getLocalVersion,
  setServer,
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  form: 'UploaderForm', // a unique identifier for this form
  validate,
  // asyncValidate,
  onSubmit,
  enableReinitialize: true
})(withStyles(styles)(ScoringServerPicker)));