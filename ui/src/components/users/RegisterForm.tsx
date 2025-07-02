import {useState} from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {useForm} from "@tanstack/react-form";
import {createAccount} from "../../api";
import {FormTextField} from "../forms.tsx";

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
        <Grid size={{xs: 12}}>
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
        <Grid size={{xs: 12}}>
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
        <Grid size={{xs: 12}}>
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
        <Grid size={{xs: 12}}>
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
        {errors && <Grid size={{xs: 12}}>
          <Typography color="error">{errors.join(', ')}</Typography>
        </Grid>}
        <Grid size={{xs: 12}}>
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