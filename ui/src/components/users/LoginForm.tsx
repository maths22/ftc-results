import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useForm} from "@tanstack/react-form";
import {login, resetPassword} from "../../api";
import {useState} from "react";
import Typography from "@mui/material/Typography";
import { FormTextField } from '../forms';

export default function LoginForm({onSubmitSuccess}: {
    onSubmitSuccess: () => void
}) {
  const [errors, setErrors] = useState<string[]>([])
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      submitType: 'login'
    },
    onSubmit: async ({ value }) => {
      const res = value.submitType == 'reset' ? await resetPassword(value.email) : await login(value.email, value.password);
      if(!res.ok) {
          setErrors(res.body.errors);
      } else {
          setErrors([]);
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
                      children={(field) => (
                          <FormTextField field={field}
                                         label={"Email"}
                                         type="email" />
          )} />
        </Grid>
        <Grid size={{xs: 12}}>
          <form.Field name="password" children={(field) => (
              <FormTextField field={field}
                             label={"Password"}
                             type="password" />
          )}/>
        </Grid>
        {errors.length > 0 && <Grid size={{xs: 12}}>
          <Typography color="error">{errors.join(', ')}</Typography>
        </Grid>}
        <Grid size={{xs: 12}}>
          <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
              children={([canSubmit, isSubmitting, isPristine]) => <>
                <Button variant="contained" type="submit" color="primary" disabled={!canSubmit}>
                  Login
                </Button>
                <Button type="submit" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.setFieldValue('submitType', 'reset')
                    form.handleSubmit();
                }} color="primary"
                        disabled={isPristine || isSubmitting} sx={{marginLeft: 1}}>
                  Forgot?
                </Button>
              </>} />
        </Grid>
      </Grid>
    </form>
  );
};