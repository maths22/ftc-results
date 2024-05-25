import {ComponentProps, useState} from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {FieldApi, useForm} from "@tanstack/react-form";
import {createAccount} from "../../api";

function FormTextField({field, ...rest}: ComponentProps<typeof TextField> & {
  field: FieldApi<any, any, any, any, any>
}) {
  return <TextField
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      error={!!field.state.meta.touchedErrors}
      helperText={field.state.meta.touchedErrors}
      style={{width: '100%'}}
      {...rest}
  />
}

export default function RegisterForm({onSubmitSuccess}: {
    onSubmitSuccess: () => void
}) {
    const [errors, setErrors] = useState<string[]>([])
    const form = useForm({
        defaultValues: {
            email: '',
            name: '',
            password: '',
            password_confirmation: '',
        },
        onSubmit: async ({ value }) => {
            const res = await createAccount(value);
            if(!res.ok) {
                setErrors(res.body.errors);
            } else {
                setErrors([]);
                window.alert('Registration successful.\nCheck your email to confirm your account and sign in.');
                onSubmitSuccess();
            }
        },
    })
  return (
    <form onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
    }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <form.Field name="email"
                      validators={{
                        onChange: ({value}) =>
                            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? undefined : 'Invalid email address'
                      }}
                      children={(field) => (
                          <FormTextField field={field}
                                         label={"Email"}
                                         type="email"/>
                      )}/>
        </Grid>
        <Grid item xs={12}>
          <form.Field name="name"
                      validators={{
                        onChange: ({value}) => value && value.length > 0 ? undefined : 'Required'
                      }}
                      children={(field) => (
                          <FormTextField field={field}
                                         label={"Name"}
                                         />
                      )}/>
        </Grid>
        <Grid item xs={12}>
          <form.Field name="password"
                      validators={{
                        onChange: ({value}) => value && value.length > 0 ? undefined : 'Required'
                      }}
                      children={(field) => (
                          <FormTextField field={field}
                                         label={"Password"}
                                         type="password"
                          />
                      )}/>
        </Grid>
        <Grid item xs={12}>
          <form.Field name="password_confirmation"
                      validators={{
                        onChange: ({value}) => value && value.length > 0 ? undefined : 'Required'
                      }}
                      children={(field) => (
                          <FormTextField field={field}
                                         label={"Confirm password"}
                                         type="password"
                          />
                      )}/>
        </Grid>
        {errors && <Grid item xs={12}>
          <Typography color="error">{errors.join(', ')}</Typography>
        </Grid>}
        <Grid item xs={12}>
            <form.Subscribe
                selector={(state) => [state.canSubmit]}
                children={([canSubmit]) => <Button variant="contained" type="submit" color="primary" disabled={!canSubmit}>
                    Register
                  </Button>} />
        </Grid>
      </Grid>
    </form>
  );
}